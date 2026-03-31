import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { syncGitToPrisma } from "@/lib/git";

const REPOS_ROOT = path.join(process.cwd(), "data/repos");
const GIT_HTTP_BACKEND = "/usr/lib/git-core/git-http-backend";

interface Params {
  owner: string;
  repo: string;
  path: string[];
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  return handleGitRequest(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<Params> }) {
  return handleGitRequest(request, await params);
}

async function handleGitRequest(request: NextRequest, params: Params) {
  const { owner, repo, path: gitPathParts } = params;
  const gitPath = gitPathParts.join("/");
  const repoName = repo.endsWith(".git") ? repo : `${repo}.git`;
  const repoFullPath = path.join(REPOS_ROOT, owner, repoName);

  let sessionUser = null;
  const session = await getServerSession(authOptions);
  
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Basic ")) {
    const base64Credentials = authHeader.substring(6);
    const decodedCredentials = Buffer.from(base64Credentials, "base64").toString("utf8");
    const [authIdentifier, authPassword] = decodedCredentials.split(":");
    
    if (authIdentifier && authPassword) {
      const user = await prisma.user.findFirst({
        where: {
           OR: [
             { email: authIdentifier },
             { name: authIdentifier }
           ]
        }
      });
      if (user && user.password) {
        const isValid = await bcrypt.compare(authPassword, user.password);
        if (isValid) {
          sessionUser = user;
        }
      }
    }
  } else if (session?.user) {
     sessionUser = session.user;
  }

  const dbRepo = await prisma.repository.findFirst({
    where: {
      name: repo.replace(".git", ""),
      owner: { name: owner },
    },
    include: { owner: true }
  });

  if (!dbRepo) {
    return new NextResponse("Repository not found", { status: 404 });
  }

  const isPush = gitPath.includes("git-receive-pack") || request.nextUrl.searchParams.get("service") === "git-receive-pack";
  
  if (dbRepo.isPrivate || isPush) {
    if (!sessionUser || sessionUser.email !== dbRepo.owner.email) {
       return new NextResponse("Unauthorized", { 
         status: 401,
         headers: { 'WWW-Authenticate': 'Basic realm="WaiCode Git"' }
       });
    }
  }

  const env = {
    GIT_PROJECT_ROOT: REPOS_ROOT,
    GIT_HTTP_EXPORT_ALL: "1",
    PATH_INFO: `/${owner}/${repoName}/${gitPath}`,
    REMOTE_USER: sessionUser?.name || "anonymous",
    REMOTE_ADDR: request.headers.get("x-forwarded-for") || "127.0.0.1",
    QUERY_STRING: request.nextUrl.search.replace(/^\?/, ""),
    REQUEST_METHOD: request.method,
    CONTENT_TYPE: request.headers.get("content-type") || "",
  };

  const gitProcess = spawn(GIT_HTTP_BACKEND, [], {
    env: { ...process.env, ...env },
  });

  if (request.body) {
    const reader = request.body.getReader();
    (async () => {
      try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            gitProcess.stdin.write(value);
          }
      } catch (e) {
          console.error("Error reading request body", e);
      } finally {
          gitProcess.stdin.end();
      }
    })();
  } else {
    gitProcess.stdin.end();
  }

  return new Promise<Response>((resolve, reject) => {
    let headers: Record<string, string> = {};
    let headersParsed = false;
    let bodyBuffer = Buffer.alloc(0);
    
    gitProcess.on('exit', (code) => {
        if (!headersParsed) {
             reject(new NextResponse(`Internal Git Error, code ${code}`, { status: 500 }));
        }
        if (code === 0 && isPush) {
             syncGitToPrisma(owner, repo.replace(".git", "")).catch(console.error);
        }
    });

    const stream = new ReadableStream({
      start(controller) {
        gitProcess.stdout.on("data", (data: Buffer) => {
          if (!headersParsed) {
            bodyBuffer = Buffer.concat([bodyBuffer, data]);
            const headerEndIndex = bodyBuffer.indexOf("\r\n\r\n");
            
            if (headerEndIndex !== -1) {
               const headerLines = bodyBuffer.subarray(0, headerEndIndex).toString().split("\r\n");
               for (const line of headerLines) {
                 const delimiter = line.indexOf(": ");
                 if (delimiter !== -1) {
                     const key = line.substring(0, delimiter).toLowerCase();
                     const value = line.substring(delimiter + 2);
                     headers[key] = value;
                 }
               }
               headersParsed = true;
               
               const remainder = bodyBuffer.subarray(headerEndIndex + 4);
               if (remainder.length > 0) controller.enqueue(remainder);
               
               resolve(new NextResponse(stream, {
                 status: headers["status"] ? parseInt(headers["status"]) : 200,
                 headers: headers
               }));
            }
          } else {
            controller.enqueue(data);
          }
        });

        gitProcess.stdout.on("end", () => {
             controller.close()
        });
        
        gitProcess.stderr.on("data", (data) => console.error("GIT ERROR:", data.toString()));
      }
    });
  });
}
