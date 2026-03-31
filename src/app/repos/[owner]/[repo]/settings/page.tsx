"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { RepoHeader } from "@/components/RepoHeader";

interface SettingsPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export default function RepoSettingsPage({ params }: SettingsPageProps) {
  const { owner, repo } = use(params);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isOwner = session?.user?.name === owner;

  if (session && !isOwner) {
    return <div className="p-8 text-center text-red-600">You do not have permission to access these settings.</div>;
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${owner}/${repo}? This action is permanent!`)) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/repos/${owner}/${repo}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/");
    } else {
      alert("Error deleting repository");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <RepoHeader owner={owner} repo={repo} />
      <main className="max-w-7xl mx-auto py-10 px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Settings Sidebar */}
          <aside className="w-full md:w-64 space-y-1">
             <h3 className="text-[10px] font-black text-gh-gray uppercase tracking-widest px-3 mb-6">Repository Settings</h3>
             <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-bold rounded-lg bg-repo-hover text-fg border-l-4 border-gh-blue transition-all">
                General
             </button>
             <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-gh-gray hover:bg-repo-hover hover:text-fg transition-all">
                Branches
             </button>
             <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg text-gh-gray hover:bg-repo-hover hover:text-fg transition-all">
                Actions
             </button>
          </aside>

          {/* Main Content */}
          <div className="flex-1 max-w-3xl space-y-12">
            {/* General Section */}
            <section className="space-y-8">
               <div>
                  <h2 className="text-2xl font-black mb-1 border-b border-border-muted pb-4 tracking-tight">General settings</h2>
               </div>

               <div className="space-y-4">
                  <label className="block text-sm font-bold opacity-80 uppercase tracking-widest text-[10px]">Repository name</label>
                  <div className="flex flex-col md:flex-row gap-4">
                     <input 
                        type="text" 
                        defaultValue={repo}
                        className="flex-1 bg-header border border-border-subtle rounded-lg px-4 py-2 focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue transition-all"
                     />
                     <button className="px-5 py-2 bg-header border border-border-subtle hover:bg-repo-hover text-fg font-bold rounded-lg transition-all border-b-2">
                        Rename
                     </button>
                  </div>
               </div>

               <div className="pt-10 space-y-6">
                  <h3 className="text-lg font-black tracking-tight border-b border-border-muted pb-4">Social Preview</h3>
                  <div className="gh-card p-12 bg-header border-dashed flex flex-col items-center justify-center text-center group cursor-pointer hover:border-gh-blue transition-all">
                     <div className="w-16 h-16 bg-canvas border border-border-subtle rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-gh-gray/20" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M19 13H5v-2h14v2z" />
                        </svg>
                     </div>
                     <p className="text-xs font-bold text-gh-gray uppercase tracking-widest">Upload an image</p>
                  </div>
               </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-12 border-t border-border-muted">
               <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">Danger Zone</h3>
               <div className="gh-card border-red-500/30 overflow-hidden divide-y divide-red-500/10">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-500/[0.02]">
                     <div>
                        <p className="text-sm font-bold text-fg">Change repository visibility</p>
                        <p className="text-[11px] text-gh-gray font-medium mt-0.5">This repository is currently <span className="font-black text-fg uppercase tracking-widest">{owner === repo ? "Public" : "Private"}</span></p>
                     </div>
                     <button className="whitespace-nowrap px-4 py-1.5 bg-header border border-border-subtle hover:bg-repo-hover text-red-500 font-bold rounded-lg border-b-2 transition-all">
                        Change visibility
                     </button>
                  </div>

                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <p className="text-sm font-bold text-fg">Delete this repository</p>
                        <p className="text-[11px] text-gh-gray font-medium mt-0.5">Once you delete a repository, there is no going back. Please be certain.</p>
                     </div>
                     <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="whitespace-nowrap px-4 py-1.5 bg-red-500/10 text-red-500 font-bold border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                     >
                        {loading ? "Deleting..." : "Delete this repository"}
                     </button>
                  </div>
               </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}