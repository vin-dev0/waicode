"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function NewRepo() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, isPrivate }),
    });
    if (res.ok) {
      const repo = await res.json();
      router.push(`/repos/${session?.user?.name}/${repo.name}`);
    } else {
      alert("Error creating repository");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <main className="max-w-3xl mx-auto py-12 px-6">
        <div className="gh-card p-10 bg-header border-b-4 border-[#30363d] overflow-hidden">
          <h2 className="text-3xl font-black mb-1 border-b border-border-muted pb-6 tracking-tight">Create a new repository</h2>
          <p className="text-sm text-gh-gray font-medium mt-4 mb-8">
             A repository contains all project files, including the revision history. Already have a project repository elsewhere? <span className="text-gh-blue hover:underline cursor-pointer">Import a repository.</span>
          </p>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-bold text-fg">
                Repository name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-awesome-repo"
                className="mt-1 block w-full px-4 py-2.5 bg-canvas border border-border-subtle rounded-lg shadow-sm focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue text-fg sm:text-sm transition-all"
                required
              />
              <p className="text-[10px] text-gh-gray font-bold uppercase tracking-wider">Great repository names are short and memorable. Need inspiration? <span className="text-gh-green opacity-80 cursor-pointer">shiny-disco</span></p>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-bold text-fg">
                Description <span className="text-gh-gray font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is your project about?"
                className="mt-1 block w-full px-4 py-2.5 bg-canvas border border-border-subtle rounded-lg shadow-sm focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue text-fg sm:text-sm transition-all"
              />
            </div>
            <div className="flex items-start space-x-3 p-4 bg-canvas border border-border-muted rounded-xl hover:border-gh-blue transition-all cursor-pointer group">
               <div className="flex h-5 items-center">
                  <input
                    id="isPrivate"
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 text-gh-blue focus:ring-gh-blue/20 border-border-subtle rounded bg-header"
                  />
               </div>
               <div className="text-sm">
                  <label htmlFor="isPrivate" className="font-bold text-fg cursor-pointer">
                    Private repository
                  </label>
                  <p className="text-gh-gray font-medium mt-1">
                    You choose who can see and commit to this repository.
                  </p>
               </div>
            </div>
            <div className="pt-6 border-t border-border-muted">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2.5 bg-gh-green border-b-2 border-green-800 text-sm font-bold rounded-lg text-white hover:opacity-90 transition-all shadow-lg shadow-gh-green/10"
              >
                Create repository
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}