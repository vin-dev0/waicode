import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RepoHeader } from "@/components/RepoHeader";
import { GitCommit, User as UserIcon } from "lucide-react";

interface Params {
  owner: string;
  repo: string;
}

export default async function CommitsPage({ params }: { params: Promise<Params> }) {
  const { owner, repo } = await params;

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: { name: owner },
    },
    include: {
      commits: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
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
          <div className="flex items-center space-x-2 mb-6 text-sm">
             <GitCommit className="w-4 h-4 text-gray-400" />
             <span className="font-bold text-gray-900">{repository.commits.length}</span>
             <span className="text-gray-500 font-medium uppercase">commits</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <ul className="divide-y divide-gray-100">
              {repository.commits.map((commit: any) => (
                <li key={commit.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                       <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                       </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">{commit.message}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-1">
                        <Link href={`/${commit.author.name}`} className="font-semibold text-gray-900 hover:text-indigo-600 hover:underline">
                          {commit.author.name || commit.author.email}
                        </Link>
                        <span>committed on {new Date(commit.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                     <div className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded text-[10px] font-mono font-bold text-indigo-600 uppercase">
                        {commit.hash.slice(0, 7)}
                     </div>
                     <button className="p-1 text-gray-400 hover:text-gray-600 border border-gray-200 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                     </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}