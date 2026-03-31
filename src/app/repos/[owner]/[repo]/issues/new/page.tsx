"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NewIssuePageProps {
  params: Promise<{ owner: string; repo: string }>;
}

import { RepoHeader } from "@/components/RepoHeader";

export default function NewIssuePage({ params }: NewIssuePageProps) {
  const { owner, repo } = use(params);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    if (res.ok) {
      router.push(`/repos/${owner}/${repo}/issues`);
    } else {
      alert("Error creating issue");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <RepoHeader owner={owner} repo={repo} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                  {loading ? "Creating..." : "Submit new issue"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}