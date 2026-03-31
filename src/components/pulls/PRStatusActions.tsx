"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PRStatusActionsProps {
  owner: string;
  repo: string;
  prId: string;
  currentStatus: string;
}

export function PRStatusActions({ owner, repo, prId, currentStatus }: PRStatusActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    const res = await fetch(`/api/repos/${owner}/${repo}/pulls?id=${prId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Error updating pull request status");
    }
    setLoading(false);
  };

  if (currentStatus !== "open") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
         <div className="flex items-center space-x-2">
            <span className={`p-1.5 rounded-full ${currentStatus === 'merged' ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
               </svg>
            </span>
            <span className="text-sm font-bold text-gray-900">This pull request is {currentStatus}.</span>
         </div>
         <button
           onClick={() => handleUpdate("open")}
           disabled={loading}
           className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
         >
           Reopen pull request
         </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
       <div className="p-4 flex items-start space-x-3">
          <div className="bg-green-100 p-2 rounded-full text-green-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <div className="flex-1">
             <h3 className="text-sm font-bold text-gray-900">This branch has no conflicts with the base branch</h3>
             <p className="text-xs text-gray-500">Merging can be performed automatically.</p>
          </div>
       </div>
       <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex space-x-2">
          <button
            onClick={() => handleUpdate("merged")}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? "Merging..." : "Merge pull request"}
          </button>
          <button
            onClick={() => handleUpdate("closed")}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Close pull request
          </button>
       </div>
    </div>
  );
}