"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteFileButtonProps {
  owner: string;
  repo: string;
  path: string;
}

export function DeleteFileButton({ owner, repo, path }: DeleteFileButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${path}?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/repos/${owner}/${repo}/files?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push(`/repos/${owner}/${repo}`);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error deleting file");
        setIsDeleting(false);
      }
    } catch (e) {
      alert("Error deleting file");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center px-3 py-1 border border-red-200 rounded text-xs font-medium text-red-600 bg-white hover:bg-red-50 shadow-sm transition-all disabled:opacity-50"
    >
      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
