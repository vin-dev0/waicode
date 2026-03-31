"use client";

import { useState, use, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RepoHeader } from "@/components/RepoHeader";

interface NewFilePageProps {
  params: Promise<{ owner: string; repo: string }>;
}

function NewFileForm({ owner, repo }: { owner: string, repo: string }) {
  const searchParams = useSearchParams();
  const initialPath = searchParams.get("path") || "";
  
  const [path, setPath] = useState(initialPath ? `${initialPath}/` : "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/repos/${owner}/${repo}`)
      .then(res => res.json())
      .then(data => setRepoInfo(data));
  }, [owner, repo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/repos/${owner}/${repo}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content }),
    });
    if (res.ok) {
      router.push(`/repos/${owner}/${repo}`);
    } else {
      alert("Error creating file");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <RepoHeader 
        owner={owner} 
        repo={repo} 
        forkedFrom={repoInfo?.forkedFrom ? { owner: repoInfo.forkedFrom.owner.name, name: repoInfo.forkedFrom.name } : null}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4 font-mono">
             <Link href={`/repos/${owner}/${repo}`} className="text-indigo-600 hover:underline">{repo}</Link>
             <span>/</span>
             <input
                type="text"
                placeholder="Name your file..."
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-none w-64"
                required
             />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                 <div className="flex space-x-4">
                    <button type="button" className="text-xs font-bold text-gray-900 border-b-2 border-orange-500 pb-1">Edit</button>
                    <button type="button" className="text-xs font-medium text-gray-500 hover:text-gray-900 pb-1">Preview</button>
                 </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full p-4 text-sm font-mono border-none text-gray-900 focus:ring-0 resize-none outline-none text-gray-900"
                placeholder="File content..."
                required
              />
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
               <h3 className="text-sm font-bold text-gray-900 mb-4">Commit new file</h3>
               <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Create new file" 
                    className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded px-3 py-2 text-sm"
                    defaultValue={`Create ${path.split('/').pop() || 'new file'}`}
                  />
                  <textarea 
                    placeholder="Add an optional extended description..."
                    rows={3}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded px-3 py-2 text-sm"
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400 shadow-sm"
                    >
                      {loading ? "Committing..." : "Commit changes"}
                    </button>
                  </div>
               </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NewFilePage({ params }: NewFilePageProps) {
  const { owner, repo } = use(params);

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
       <NewFileForm owner={owner} repo={repo} />
    </Suspense>
  );
}