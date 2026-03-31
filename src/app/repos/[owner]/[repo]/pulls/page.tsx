import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RepoHeader } from "@/components/RepoHeader";

interface Params {
  owner: string;
  repo: string;
}

export default async function PullRequestsPage({ params }: { params: Promise<Params> }) {
  const { owner, repo } = await params;

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: {
        name: owner,
      },
    },
    include: {
      pullRequests: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      forkedFrom: {
        include: { owner: true }
      }
    },
  });

  if (!repository) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <RepoHeader 
        owner={owner} 
        repo={repo} 
        forkedFrom={repository.forkedFrom ? { owner: repository.forkedFrom.owner.name!, name: repository.forkedFrom.name } : null} 
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-end mb-4">
            <Link
              href={`/repos/${owner}/${repo}/pulls/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              New pull request
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center space-x-4">
               <span className="text-sm font-semibold text-gray-900">{repository.pullRequests.length} Open</span>
            </div>
            <ul className="divide-y divide-gray-200">
              {repository.pullRequests.length > 0 ? (
                repository.pullRequests.map((pr: any) => (
                  <li key={pr.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Link href={`/repos/${owner}/${repo}/pulls/${pr.id}`} className="text-sm font-bold text-gray-900 hover:text-indigo-600">
                          {pr.title}
                        </Link>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span>#{pr.id.slice(-4)}</span>
                        <span className="mx-1">opened on {pr.createdAt.toLocaleDateString()}</span>
                        <span className="mx-1">by {pr.author.name || pr.author.email}</span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 text-center text-gray-500 text-sm">
                  There are no open pull requests in this repository.
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}