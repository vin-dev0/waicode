"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GitFork } from "lucide-react";

interface ForkButtonProps {
  owner: string;
  repo: string;
}

export function ForkButton({ owner, repo }: ForkButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isOwner = session?.user?.name === owner;

  const handleFork = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/repos/${owner}/${repo}/fork`, { method: "POST" });

    if (res.ok) {
      const data = await res.json();
      router.push(`/repos/${session.user?.name}/${data.name}`);
    } else {
      const error = await res.json();
      alert(error.error || "Error forking repository");
    }
    setLoading(false);
  };

  if (isOwner) return null;

  return (
    <button
      onClick={handleFork}
      disabled={loading}
      className="flex items-center px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
    >
      <GitFork className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
      {loading ? "Forking..." : "Fork"}
    </button>
  );
}