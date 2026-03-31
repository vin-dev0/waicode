import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RepoHeader } from "@/components/RepoHeader";
import { FileList } from "@/components/FileList";
import { Markdown } from "@/components/Markdown";
import { groupFilesByDirectory } from "@/lib/utils";

interface TreePageProps {
  params: Promise<{ owner: string; repo: string; path: string[] }>;
}

export default async function TreePage({ params }: TreePageProps) {
  const { owner, repo, path } = await params;
  const currentPath = path.map((part) => decodeURIComponent(part)).join("/");

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: {
        name: owner,
      },
    },
    include: {
      files: {
        where: { branch: "main" }
      },
      forkedFrom: {
        include: { owner: true }
      }
    },
  });

  if (!repository) {
    notFound();
  }

  const groupedItems = groupFilesByDirectory(repository.files, currentPath);
  const readmeFile = repository.files.find((f: any) => f.path.toLowerCase() === `${currentPath}/readme.md`);

  // Check if currentPath actually exists as a directory (if any file starts with it)
  if (currentPath && groupedItems.length === 0 && !repository.files.some((f: any) => f.path.startsWith(currentPath + "/"))) {
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
        <div className="px-4 sm:px-0 space-y-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center space-x-2">
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-3 py-1.5 space-x-2 cursor-pointer hover:bg-gray-100 transition-colors">
                   <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                   </svg>
                   <span className="text-sm font-medium text-gray-900">main</span>
                   <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                </div>
             </div>
             
             <div className="flex items-center space-x-4">
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                   <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                   </svg>
                   Code
                </button>
             </div>
          </div>

          <FileList owner={owner} repo={repo} items={groupedItems} currentPath={currentPath} />

          {readmeFile && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
               <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-900">README.md</span>
               </div>
               <div className="p-8">
                  <Markdown content={readmeFile.content} />
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
