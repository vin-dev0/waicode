"use client";

import Link from "next/link";
import { Folder, FileText, ChevronRight, Plus } from "lucide-react";

interface FileListProps {
  owner: string;
  repo: string;
  items: any[];
  currentPath: string;
}

export function FileList({ owner, repo, items, currentPath }: FileListProps) {
  const pathParts = currentPath ? currentPath.split("/") : [];

  return (
    <div className="gh-card overflow-hidden">
      <div className="bg-header px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gh-gray font-mono">
           <Link href={`/repos/${owner}/${repo}`} className="text-gh-blue hover:underline font-semibold">{repo}</Link>
           {pathParts.map((part, index) => {
             const isLast = index === pathParts.length - 1;
             const partPath = pathParts.slice(0, index + 1).join("/");
             return (
               <div key={partPath} className="flex items-center space-x-2">
                 <span className="text-gh-gray/40">/</span>
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
        <div className="flex items-center space-x-4">
           <Link
             href={`/repos/${owner}/${repo}/new-file?path=${encodeURIComponent(currentPath)}`}
             className="inline-flex items-center px-3 py-1.5 border border-border-subtle rounded-lg text-xs font-bold text-fg bg-canvas hover:bg-repo-hover shadow-sm transition-all shadow-gh-blue/5 border-b-2"
           >
             <Plus className="w-3.5 h-3.5 mr-1.5 text-gh-gray" /> Add file
           </Link>
        </div>
      </div>
      <ul className="divide-y divide-border-muted">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.path} className="hover:bg-repo-hover transition-colors group">
              <Link
                href={
                  item.type === "dir"
                    ? `/repos/${owner}/${repo}/tree/${item.path.split('/').map((p: string) => encodeURIComponent(p)).join('/')}`
                    : `/repos/${owner}/${repo}/blob/${item.path.split('/').map((p: string) => encodeURIComponent(p)).join('/')}`
                }
                className="flex items-center px-4 py-3 text-sm text-fg group-hover:text-gh-blue transition-colors"
              >
                <div className="mr-3 text-gh-gray group-hover:text-gh-blue transition-colors">
                   {item.type === "dir" ? (
                     <Folder className="w-4 h-4 fill-current opacity-40" />
                   ) : (
                     <FileText className="w-4 h-4" />
                   )}
                </div>
                <span className={`truncate ${item.type === "dir" ? "font-semibold" : ""}`}>
                  {item.name}
                </span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
              </Link>
            </li>
          ))
        ) : (
          <li className="px-4 py-20 text-center text-gh-gray text-sm space-y-2">
            <Folder className="w-12 h-12 mx-auto text-gh-gray/20" />
            <p className="font-medium italic">This directory is empty.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
