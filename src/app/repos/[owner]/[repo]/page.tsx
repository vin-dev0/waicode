import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface RepoPageProps {
  params: { owner: string; repo: string };
}

import { RepoHeader } from "@/components/RepoHeader";
import { Markdown } from "@/components/Markdown";
import { FileList } from "@/components/FileList";
import { groupFilesByDirectory } from "@/lib/utils";
import { RepoCodeDropdown } from "@/components/RepoCodeDropdown";

export default async function RepoPage({ params }: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = await params;

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: {
        name: owner,
      },
    },
    include: {
      owner: true,
      files: {
        where: { branch: "main" }
      },
      forkedFrom: {
        include: { owner: true }
      },
      _count: {
        select: { commits: true }
      }
    },
  });

  if (!repository) {
    notFound();
  }

  const groupedItems = groupFilesByDirectory(repository.files, "");
  const readmeFile = repository.files.find((f: any) => f.path.toLowerCase() === "readme.md");

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <RepoHeader 
        owner={owner} 
        repo={repo} 
        forkedFrom={repository.forkedFrom ? { owner: repository.forkedFrom.owner.name!, name: repository.forkedFrom.name } : null} 
      />
      <main className="max-w-7xl mx-auto py-6 md:px-8">
        <div className="px-4 md:px-0 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center space-x-2">
                <div className="flex items-center bg-header border border-border-subtle rounded-lg px-3 py-1.5 space-x-3 cursor-pointer hover:bg-repo-hover transition-all border-b-2 shadow-sm shadow-gh-blue/5 group">
                   <svg className="w-4 h-4 text-gh-gray group-hover:text-gh-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                   </svg>
                   <span className="text-sm font-bold text-fg">main</span>
                   <svg className="w-3 h-3 text-gh-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                </div>

                <Link 
                  href={`/repos/${owner}/${repo}/commits`}
                  className="flex items-center space-x-1.5 text-sm text-gh-gray hover:text-gh-blue transition-colors ml-4 group"
                >
                   <svg className="w-4 h-4 text-gh-gray group-hover:text-gh-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <span className="font-bold text-fg group-hover:text-gh-blue transition-colors">{repository._count.commits}</span>
                   <span>commits</span>
                </Link>
             </div>
             
             <div className="flex items-center space-x-4 text-sm">
                <p className="hidden lg:block text-gh-gray font-medium">{repository.description}</p>
                <RepoCodeDropdown owner={owner} repo={repo} />
             </div>
          </div>

          <FileList owner={owner} repo={repo} items={groupedItems} currentPath="" />

          {readmeFile && (
            <div className="gh-card overflow-hidden">
               <div className="bg-header px-4 py-3 border-b border-border-subtle flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gh-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-bold text-fg uppercase tracking-wider">README.md</span>
               </div>
               <div className="p-10 bg-canvas text-fg">
                  <Markdown content={readmeFile.content} />
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}