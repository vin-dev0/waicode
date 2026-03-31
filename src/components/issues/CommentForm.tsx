"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  issueId: string;
  owner: string;
  repo: string;
  isPR?: boolean;
}

export function CommentForm({ issueId, owner, repo, isPR = false }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/repos/${owner}/${repo}/issues/${issueId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, prId: isPR }),
    });
    if (res.ok) {
      setBody("");
      router.refresh();
    } else {
      alert("Error adding comment");
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
       <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-900">Add a comment</span>
       </div>
       <form onSubmit={handleSubmit}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full p-4 text-sm border-none focus:ring-0 placeholder-gray-400"
            placeholder="Leave a comment"
            required
          />
          <div className="bg-white px-4 py-3 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || !body.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Posting..." : "Comment"}
            </button>
          </div>
       </form>
    </div>
  );
}