"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RepoHeader } from "@/components/RepoHeader";

interface EditFilePageProps {
  params: Promise<{ owner: string; repo: string; path: string[] }>;
}

export default function EditFilePage({ params }: EditFilePageProps) {
  const { owner, repo, path } = use(params);
  const filePath = path.join("/");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch file content
    fetch(`/api/repos/${owner}/${repo}/files?path=${encodeURIComponent(filePath)}`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content);
        setLoading(false);
      });

    // Fetch repo info for header
    fetch(`/api/repos/${owner}/${repo}`)
      .then(res => res.json())
      .then(data => setRepoInfo(data));
  }, [owner, repo, filePath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/repos/${owner}/${repo}/files`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath, content }),
    });
    if (res.ok) {
      router.push(`/repos/${owner}/${repo}/blob/${filePath}`);
    } else {
      alert("Error saving file");
    }
    setSaving(false);
  };

  if (loading) {
    return (
       <div className="flex h-screen items-center justify-center bg-canvas">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gh-blue"></div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <RepoHeader 
        owner={owner} 
        repo={repo} 
        forkedFrom={repoInfo?.forkedFrom ? { owner: repoInfo.forkedFrom.owner.name, name: repoInfo.forkedFrom.name } : null}
      />
      <main className="max-w-7xl mx-auto py-8 px-4 md:px-8">
        <div className="px-4 md:px-0">
          <div className="flex items-center space-x-2 text-sm text-gh-gray mb-6 font-mono">
             <Link href={`/repos/${owner}/${repo}`} className="text-gh-blue hover:underline font-bold">
               {repo}
             </Link>
             <span className="opacity-40">/</span>
             <span className="font-bold text-fg">{filePath}</span>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="gh-card overflow-hidden">
              <div className="bg-header px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                 <span className="text-[10px] font-black text-fg uppercase tracking-widest">Edit Mode</span>
                 <div className="flex items-center space-x-4 text-[10px] text-gh-gray font-bold uppercase tracking-widest">
                    <span>{content.split("\n").length} lines</span>
                    <span className="opacity-40">|</span>
                    <span>UTF-8</span>
                 </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={25}
                className="w-full p-8 text-sm font-mono border-none bg-canvas text-fg focus:ring-0 selection:bg-gh-blue/30 leading-relaxed"
                placeholder="Write your code here..."
                required
              />
            </div>
            <div className="flex justify-end items-center space-x-4 pt-6 border-t border-border-muted">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 text-sm font-bold text-fg bg-header border border-border-subtle rounded-lg hover:bg-repo-hover transition-all border-b-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-sm font-bold text-white bg-gh-green rounded-lg hover:opacity-90 disabled:bg-gh-gray/20 transition-all border-b-2 border-green-800 shadow-lg shadow-gh-green/10"
              >
                {saving ? "Committing..." : "Commit changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}