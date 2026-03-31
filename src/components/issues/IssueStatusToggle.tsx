"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface IssueStatusToggleProps {
  owner: string;
  repo: string;
  issueId: string;
  currentStatus: string;
}

export function IssueStatusToggle({ owner, repo, issueId, currentStatus }: IssueStatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = currentStatus === "open" ? "closed" : "open";
    const res = await fetch(`/api/repos/${owner}/${repo}/issues?id=${issueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Error updating issue status");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-1.5 text-sm font-medium rounded border transition-all ${
        currentStatus === "open"
          ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-600 hover:text-white"
          : "text-green-600 border-green-200 bg-green-50 hover:bg-green-600 hover:text-white"
      } disabled:opacity-50`}
    >
      {loading ? "Updating..." : currentStatus === "open" ? "Close issue" : "Reopen issue"}
    </button>
  );
}