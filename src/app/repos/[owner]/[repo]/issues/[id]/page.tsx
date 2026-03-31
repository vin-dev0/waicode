import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RepoHeader } from "@/components/RepoHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CommentForm } from "@/components/issues/CommentForm";
import { Markdown } from "@/components/Markdown";
import { IssueStatusToggle } from "@/components/issues/IssueStatusToggle";

interface Params {
  owner: string;
  repo: string;
  id: string;
}

export default async function IssueDetailPage({ params }: { params: Promise<Params> }) {
  const { owner, repo, id } = await params;
  const session = await getServerSession(authOptions);

  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      author: true,
      repo: {
        include: {
          owner: true,
          forkedFrom: {
            include: { owner: true }
          }
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

  if (!issue) {
    notFound();
  }

  const isAllowedToToggle = session && (
    session.user?.email === issue.author.email ||
    session.user?.email === issue.repo.owner.email
  );

  return (
    <div className="min-h-screen bg-white">
      <RepoHeader 
        owner={owner} 
        repo={repo} 
        forkedFrom={issue.repo.forkedFrom ? { owner: issue.repo.forkedFrom.owner.name!, name: issue.repo.forkedFrom.name } : null}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="border-b border-gray-200 pb-4 mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-medium text-gray-900 mb-2">
                {issue.title} <span className="text-gray-400 font-light">#{id.slice(-4)}</span>
              </h1>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  issue.status === "open" ? "bg-green-600 text-white" : "bg-purple-600 text-white"
                }`}>
                  {issue.status === "open" ? "Open" : "Closed"}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {issue.author.name || issue.author.email} opened this issue on {issue.createdAt.toLocaleDateString()} · {issue.comments.length} comments
                </span>
              </div>
            </div>

            {isAllowedToToggle && (
               <IssueStatusToggle 
                 owner={owner} 
                 repo={repo} 
                 issueId={id} 
                 currentStatus={issue.status} 
               />
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {/* Original Issue Body */}
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{issue.author.name || issue.author.email} commented</span>
                </div>
                <div className="p-4 text-gray-900 text-sm leading-relaxed">
                  <Markdown content={issue.body || "No description provided."} />
                </div>
              </div>

              {/* Comments */}
              {issue.comments.map((comment: any) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{comment.author.name || comment.author.email} commented</span>
                    <span className="text-xs text-gray-500">{comment.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="p-4 text-gray-900 text-sm leading-relaxed">
                    <Markdown content={comment.body} />
                  </div>
                </div>
              ))}

              {/* Add Comment Form */}
              {session ? (
                <CommentForm issueId={id} owner={owner} repo={repo} />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                   <p className="text-sm text-gray-600">Please <Link href="/auth/signin" className="text-indigo-600 font-medium hover:underline">sign in</Link> to comment.</p>
                </div>
              )}
            </div>

            <div className="w-full lg:w-64 space-y-6">
               <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignees</h3>
                  <p className="text-xs text-gray-400">No one assigned</p>
               </div>
               <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Labels</h3>
                  <p className="text-xs text-gray-400">None yet</p>
               </div>
               <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Projects</h3>
                  <p className="text-xs text-gray-400">None yet</p>
               </div>
               <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Milestone</h3>
                  <p className="text-xs text-gray-400">No milestone</p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
