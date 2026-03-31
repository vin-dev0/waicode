"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StarButtonProps {
  owner: string;
  repo: string;
}

export function StarButton({ owner, repo }: StarButtonProps) {
  const { data: session } = useSession();
  const [isStarred, setIsStarred] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/repos/${owner}/${repo}/star`)
      .then((res) => res.json())
      .then((data) => {
        setIsStarred(data.isStarred);
        setCount(data.count);
        setLoading(false);
      });
  }, [owner, repo, session]);

  const handleStar = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const method = isStarred ? "DELETE" : "POST";
    const res = await fetch(`/api/repos/${owner}/${repo}/star`, { method });

    if (res.ok) {
      setIsStarred(!isStarred);
      setCount(isStarred ? count - 1 : count + 1);
    }
  };

  if (loading) {
    return <div className="h-7 w-20 bg-gray-100 animate-pulse rounded-md"></div>;
  }

  return (
    <div className="flex items-center shadow-sm rounded-md border border-gray-300 overflow-hidden">
      <button
        onClick={handleStar}
        className={`flex items-center px-3 py-1.5 text-xs font-medium transition-colors ${
          isStarred
            ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <svg
          className={`w-3.5 h-3.5 mr-1.5 ${isStarred ? "text-yellow-400 fill-current" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        {isStarred ? "Starred" : "Star"}
      </button>
      <div className="px-2.5 py-1.5 bg-white border-l border-gray-300 text-xs font-bold text-gray-700">
        {count}
      </div>
    </div>
  );
}