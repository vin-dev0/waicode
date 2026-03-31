import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CodeViewer } from "@/components/CodeViewer";
import { RepoHeader } from "@/components/RepoHeader";
import { DeleteFileButton } from "@/components/DeleteFileButton";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface BlobPageProps {
  params: Promise<{ owner: string; repo: string; path: string[] }>;
}

export default async function BlobPage({ params }: BlobPageProps) {
  const { owner, repo, path } = await params;
  const session = await getServerSession(authOptions);
  const filePath = path.map((part) => decodeURIComponent(part)).join("/");

  const repository = await prisma.repository.findFirst({
    where: {
      name: repo,
      owner: {
        name: owner,
      },
    },
    include: {
      owner: true,
      files: true,
      forkedFrom: {
        include: { owner: true }
      }
    },
  });

  const file = repository?.files.find((f: any) => f.path === filePath);

  if (!file) {
    notFound();
  }

  const isOwner = session?.user?.email === repository.owner.email;

  // Simple language detection
  const extension = filePath.split(".").pop() || "text";
  const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    tsx: "typescript",
    jsx: "javascript",
    py: "python",
    rs: "rust",
    go: "go",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
  };
  const language = languageMap[extension] || "text";

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <RepoHeader 
        owner={owner} 
        repo={repo} 
        forkedFrom={repository.forkedFrom ? { owner: repository.forkedFrom.owner.name!, name: repository.forkedFrom.name } : null} 
      />
      <main className="max-w-7xl mx-auto py-8 md:px-8">
        <div className="px-4 md:px-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-2 text-sm text-gh-gray font-mono overflow-x-auto no-scrollbar">
              <Link href={`/repos/${owner}/${repo}`} className="text-gh-blue hover:underline font-bold">
                {repo}
              </Link>
              {path.map((part, index) => {
                const isLast = index === path.length - 1;
                const partPath = path.slice(0, index + 1).join("/");
                return (
                  <div key={partPath} className="flex items-center space-x-2">
                    <span className="opacity-40">/</span>
                    {isLast ? (
                      <span className="font-bold text-fg">{part}</span>
                    ) : (
                      <Link href={`/repos/${owner}/${repo}/tree/${partPath}`} className="text-gh-blue hover:underline">
                        {part}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2">
              {isOwner && (
                <Link
                  href={`/repos/${owner}/${repo}/edit/${filePath}`}
                  className="inline-flex items-center px-3 py-1.5 border border-border-subtle rounded-lg text-xs font-bold text-fg bg-header hover:bg-repo-hover shadow-sm border-b-2 transition-all"
                >
                  <svg className="w-4 h-4 mr-2 text-gh-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit file
                </Link>
              )}
              {isOwner && (
                <DeleteFileButton owner={owner} repo={repo} path={filePath} />
              )}
            </div>
          </div>

          <div className="gh-card overflow-hidden">
             <div className="bg-header px-4 py-3 border-b border-border-subtle flex items-center justify-between text-xs text-gh-gray font-bold uppercase tracking-widest">
                <div className="flex items-center space-x-4">
                  <span>{file.content.split("\n").length} lines</span>
                  <span className="opacity-40 select-none">|</span>
                  <span>{file.content.length} bytes</span>
                </div>
                <span className="lowercase opacity-60">{language}</span>
             </div>
             <div className="bg-canvas">
                <CodeViewer code={file.content} language={language} />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}