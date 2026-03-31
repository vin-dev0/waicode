import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RepoHeader } from "@/components/RepoHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CommentForm } from "@/components/issues/CommentForm";
import { PRStatusActions } from "@/components/pulls/PRStatusActions";
import { Markdown } from "@/components/Markdown";
import { DiffViewer } from "@/components/DiffViewer";

interface Params {
  owner: string;
  repo: string;
  id: string;
}

export default async function PullRequestDetailPage({ params }: { params: Promise<Params> }) {
  const { owner, repo, id } = await params;
  const session = await getServerSession(authOptions);

  const pr = await prisma.pullRequest.findUnique({
    where: { id },
    include: {
      author: true,
      repo: {
        include: {
          owner: true,
          forkedFrom: {
            include: { owner: true }
          },
          files: true, // Fetch all files to compare branches
        }
      },
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!pr) {
    notFound();
  }

  const isRepoOwner = session?.user?.email === pr.repo.owner.email;

  // Compare files between branches
  const baseFiles = pr.repo.files.filter((f: any) => f.branch === pr.baseBranch);
  const headFiles = pr.repo.files.filter((f: any) => f.branch === pr.headBranch);
  
  const changedFiles = headFiles.map((headFile: any) => {
    const baseFile = baseFiles.find((bf: any) => bf.path === headFile.path);
    if (!baseFile || baseFile.content !== headFile.content) {
       return {
         path: headFile.path,
         oldContent: baseFile?.content || "",
         newContent: headFile.content
       };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <RepoHeader 
        owner={owner} 
        repo={repo} 
        forkedFrom={pr.repo.forkedFrom ? { owner: pr.repo.forkedFrom.owner.name!, name: pr.repo.forkedFrom.name } : null}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-3xl font-medium text-gray-900 mb-2">
              {pr.title} <span className="text-gray-400 font-light">#{id.slice(-4)}</span>
            </h1>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                pr.status === "open" ? "bg-green-600 text-white" : pr.status === "merged" ? "bg-purple-600 text-white" : "bg-red-600 text-white"
              }`}>
                {pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}
              </span>
              <span className="text-gray-500 font-medium">
                {pr.author.name || pr.author.email} wants to merge <span className="font-bold text-gray-900">{changedFiles.length} files</span> into <span className="font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs">{pr.baseBranch}</span> from <span className="font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs">{pr.headBranch}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
              {/* Tabs for PR */}
              <div className="border-b border-gray-200">
                 <nav className="flex space-x-8">
                    <button className="border-b-2 border-orange-500 py-4 px-1 text-sm font-medium text-gray-900">Conversation</button>
                    <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Commits</button>
                    <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Files changed <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">{changedFiles.length}</span></button>
                 </nav>
              </div>

              {/* PR Body */}
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{pr.author.name || pr.author.email} commented</span>
                </div>
                <div className="p-6 text-gray-900 text-sm leading-relaxed">
                   <Markdown content={pr.body || "No description provided."} />
                </div>
              </div>

              {/* Diffs */}
              <div className="space-y-4">
                 <h2 className="text-lg font-bold text-gray-900">Changes</h2>
                 {changedFiles.length > 0 ? (
                   changedFiles.map((file: any) => (
                     <DiffViewer 
                       key={file.path} 
                       fileName={file.path} 
                       oldCode={file.oldContent} 
                       newCode={file.newContent} 
                     />
                   ))
                 ) : (
                   <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-200">No file changes detected between these branches.</p>
                 )}
              </div>

              {/* Timeline (PR status changes) */}
              {isRepoOwner && (
                <PRStatusActions owner={owner} repo={repo} prId={id} currentStatus={pr.status} />
              )}

              {/* Comments */}
              <div className="space-y-6">
                {pr.comments.map((comment: any) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{comment.author.name || comment.author.email} commented</span>
                      <span className="text-xs text-gray-500">{comment.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="p-6 text-gray-900 text-sm leading-relaxed">
                      <Markdown content={comment.body} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              {session ? (
                 <CommentForm issueId={id} owner={owner} repo={repo} isPR={true} />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                   <p className="text-sm text-gray-600">Please <Link href="/auth/signin" className="text-indigo-600 font-medium hover:underline">sign in</Link> to comment.</p>
                </div>
              )}
            </div>
            
            <div className="w-full lg:w-64 space-y-6">
               <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reviewers</h3>
                  <p className="text-xs text-gray-400 font-light">No reviewers yet</p>
               </div>
               <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignees</h3>
                  <p className="text-xs text-gray-400 font-light">No one assigned</p>
               </div>
               <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Labels</h3>
                  <p className="text-xs text-gray-400 font-light">None yet</p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}