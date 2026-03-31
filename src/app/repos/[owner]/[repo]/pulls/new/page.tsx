"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RepoHeader } from "@/components/RepoHeader";

interface NewPRPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export default function NewPRPage({ params }: NewPRPageProps) {
  const { owner, repo } = use(params);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [baseBranch, setBaseBranch] = useState("main");
  const [headBranch, setHeadBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, baseBranch, headBranch }),
    });
    if (res.ok) {
      router.push(`/repos/${owner}/${repo}/pulls`);
    } else {
      alert("Error creating pull request");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <RepoHeader owner={owner} repo={repo} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open a pull request</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex space-x-2 items-center bg-gray-50 p-3 border border-gray-200 rounded-md mb-6">
               <span className="text-xs font-semibold uppercase text-gray-500">Base:</span>
               <input 
                 value={baseBranch}
                 onChange={(e) => setBaseBranch(e.target.value)}
                 className="bg-white border border-gray-300 rounded px-2 py-1 text-xs"
               />
               <span className="text-gray-400">←</span>
               <span className="text-xs font-semibold uppercase text-gray-500">Head:</span>
               <input 
                 value={headBranch}
                 onChange={(e) => setHeadBranch(e.target.value)}
                 placeholder="compare-branch"
                 className="bg-white border border-gray-300 rounded px-2 py-1 text-xs"
                 required
               />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Leave a comment"
                  required
                />
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
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
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? "Creating..." : "Create pull request"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}