import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import simpleGit from "simple-git";
import { prisma } from "./prisma";

const execPromise = promisify(exec);
const REPOS_ROOT = path.join(process.cwd(), "data/repos");

export async function initBareRepo(owner: string, repoName: string) {
  const repoPath = path.join(REPOS_ROOT, owner, `${repoName}.git`);
  
  try {
    await fs.mkdir(path.join(REPOS_ROOT, owner), { recursive: true });
    await execPromise(`git init --bare "${repoPath}"`);
    await execPromise(`git --git-dir="${repoPath}" symbolic-ref HEAD refs/heads/main`);
    return repoPath;
  } catch (error) {
    console.error("Error initializing bare repo:", error);
    throw error;
  }
}

export async function getRepoPath(owner: string, repoName: string) {
  return path.join(REPOS_ROOT, owner, `${repoName}.git`);
}

export async function listGitFiles(owner: string, repoName: string, branch: string = "main", folder: string = "") {
  const repoPath = await getRepoPath(owner, repoName);
  const git = simpleGit(repoPath);
  
  try {
    const count = await git.raw(['rev-list', '--all', '--count']);
    if (parseInt(count) === 0) return [];

    const result = await git.raw(['ls-tree', '-r', '--name-only', branch]);
    const files = result.split('\n').filter(Boolean);
    
    return files.map(f => ({ path: f }));
  } catch (e) {
    return [];
  }
}

export async function getGitFileContent(owner: string, repoName: string, branch: string, filePath: string) {
  const repoPath = await getRepoPath(owner, repoName);
  const git = simpleGit(repoPath);
  
  try {
    return await git.show([`${branch}:${filePath}`]);
  } catch (e) {
    return null;
  }
}

export async function getGitCommits(owner: string, repoName: string, branch: string = "main") {
  const repoPath = await getRepoPath(owner, repoName);
  const git = simpleGit(repoPath);
  
  try {
    const logs = await git.log({ from: branch });
    // simpleGit's log `from` doesn't always work if branch doesn't exist, handle it safely
    return logs.all.map(l => ({
      id: l.hash,
      hash: l.hash,
      message: l.message,
      createdAt: l.date,
      author: {
        name: l.author_name,
        email: l.author_email
      }
    }));
  } catch (e) {
    // try default rev-list if exact branch log fails
    try {
        const fallbackLogs = await git.log();
        return fallbackLogs.all.map(l => ({
          id: l.hash,
          hash: l.hash,
          message: l.message,
          createdAt: l.date,
          author: {
            name: l.author_name,
            email: l.author_email
          }
        }));
    } catch(err) {
        return [];
    }
  }
}

export async function syncGitToPrisma(ownerName: string, repoName: string) {
  try {
    const dbRepo = await prisma.repository.findFirst({
      where: { name: repoName, owner: { name: ownerName } },
      include: { owner: true }
    });
    
    if (!dbRepo) return;
    
    const repoPath = await getRepoPath(ownerName, repoName);
    const git = simpleGit(repoPath);
    const branchSummary = await git.branch();
    const branches = branchSummary.all.length > 0 ? branchSummary.all : ["main"];

    for (const branch of branches) {
        // Strip out 'remotes/origin/' if any, just in case
        const cleanBranch = branch.replace('remotes/origin/', '');

        const files = await listGitFiles(ownerName, repoName, cleanBranch);
        const commits = await getGitCommits(ownerName, repoName, cleanBranch);
        
        // Handle physical file deletions
        const activePaths = new Set(files.map(f => f.path));
        const existingFiles = await prisma.file.findMany({
            where: { repoId: dbRepo.id, branch: cleanBranch }
        });
        
        for (const existingFile of existingFiles) {
            if (!activePaths.has(existingFile.path)) {
                await prisma.file.delete({ where: { id: existingFile.id } });
            }
        }

        // Handle creations and updates
        for (const f of files) {
           const content = await getGitFileContent(ownerName, repoName, cleanBranch, f.path);
           if (content !== null) {
              const existingFile = await prisma.file.findUnique({
                  where: {
                     repoId_branch_path: {
                        repoId: dbRepo.id,
                        branch: cleanBranch,
                        path: f.path
                     }
                  }
              });
              
              if (existingFile) {
                  // Only update if content changed or if you want to force update
                  if (existingFile.content !== content) {
                     await prisma.file.update({
                         where: { id: existingFile.id },
                         data: { content: content, updatedAt: new Date() }
                     });
                  }
              } else {
                  await prisma.file.create({
                      data: {
                          path: f.path,
                          content: content,
                          branch: cleanBranch,
                          repoId: dbRepo.id
                      }
                  });
              }
           }
        }
        
        // Sync Commits
        for (const c of commits) {
           const existingCommit = await prisma.commit.findUnique({ where: { hash: c.hash } });
           if (!existingCommit) {
               const user = await prisma.user.findFirst({ where: { 
                   OR: [
                       { email: c.author.email },
                       { name: c.author.name }
                   ]
               } });
               await prisma.commit.create({
                   data: {
                       message: c.message,
                       hash: c.hash,
                       authorId: user ? user.id : dbRepo.owner.id,
                       repoId: dbRepo.id,
                       branch: cleanBranch,
                       createdAt: new Date(c.createdAt)
                   }
               });
           }
        }
    }
  } catch (error) {
    console.error("Error syncing git to Prisma", error);
  }
}

export async function commitFileToGit(
  owner: string, 
  repoName: string, 
  branch: string, 
  filePath: string, 
  content: string, 
  message: string, 
  authorName: string, 
  authorEmail: string
) {
  const repoPath = await getRepoPath(owner, repoName);
  
  // Ensure the bare repository exists
  try {
    await fs.access(repoPath);
  } catch {
    console.log(`Repository ${repoPath} not found physically. Initializing now...`);
    await initBareRepo(owner, repoName);
  }

  const tmpDir = path.join("/tmp", `waicode-clone-${Date.now()}-${Math.random().toString().slice(2)}`);
  
  try {
    await execPromise(`git clone "${repoPath}" "${tmpDir}"`);
    
    const cloneGit = simpleGit(tmpDir);
    await cloneGit.addConfig("user.name", authorName);
    await cloneGit.addConfig("user.email", authorEmail);
    
    try {
       await cloneGit.checkout(branch);
    } catch {
       await cloneGit.checkoutLocalBranch(branch);
    }

    const absoluteFilePath = path.join(tmpDir, filePath);
    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
    await fs.writeFile(absoluteFilePath, content, "utf8");

    await cloneGit.add(filePath);
    await cloneGit.commit(message);
    await cloneGit.push('origin', branch);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function deleteFileFromGit(
  owner: string, 
  repoName: string, 
  branch: string, 
  filePath: string, 
  message: string, 
  authorName: string, 
  authorEmail: string
) {
  const repoPath = await getRepoPath(owner, repoName);
  const tmpDir = path.join("/tmp", `waicode-delete-${Date.now()}-${Math.random().toString().slice(2)}`);
  
  try {
    await execPromise(`git clone "${repoPath}" "${tmpDir}"`);
    
    const cloneGit = simpleGit(tmpDir);
    await cloneGit.addConfig("user.name", authorName);
    await cloneGit.addConfig("user.email", authorEmail);
    
    try {
       await cloneGit.checkout(branch);
    } catch {
       // if branch doesn't exist, we can't delete from it
       return;
    }

    const absoluteFilePath = path.join(tmpDir, filePath);
    try {
      await fs.unlink(absoluteFilePath);
      await cloneGit.add(filePath); // git add -u or just add works to stage deletion
      await cloneGit.commit(message);
      await cloneGit.push('origin', branch);
    } catch (e) {
      console.error(`File ${filePath} not found in clone for deletion`, e);
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
