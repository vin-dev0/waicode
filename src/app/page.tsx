"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GitFork } from "lucide-react";

interface Repository {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  owner: {
    name: string;
  };
  forkedFrom?: {
    name: string;
    owner: {
      name: string;
    };
  };
  _count: {
    stars: number;
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const [userRepos, setUserRepos] = useState<Repository[]>([]);
  const [allRepos, setAllRepos] = useState<Repository[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      // Fetch user's own repositories
      fetch("/api/repos")
        .then((res) => res.json())
        .then((data) => setUserRepos(data))
        .catch((err) => console.error(err));

      // Fetch all public repositories for the feed
      fetch("/api/repos?all=true")
        .then((res) => res.json())
        .then((data) => setAllRepos(data))
        .catch((err) => console.error(err));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gh-blue"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="flex items-center space-x-2 mb-6 px-1">
               <div className="w-6 h-6 bg-gh-blue/20 ring-1 ring-gh-blue/30 rounded-full flex items-center justify-center text-[10px] font-bold text-gh-blue">
                  {session.user?.name?.[0].toUpperCase() || session.user?.email?.[0].toUpperCase()}
               </div>
               <span className="text-sm font-bold truncate">{session.user?.name || session.user?.email}</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gh-gray uppercase tracking-wider">Top Repositories</h2>
              <Link
                href="/repos/new"
                className="inline-flex items-center px-2 py-1 border border-border-subtle text-[10px] font-bold uppercase rounded bg-gh-green text-white hover:opacity-90 shadow-sm border-b-2 transition-all"
              >
                New
              </Link>
            </div>

            <div className="space-y-1">
              {userRepos.length > 0 ? (
                userRepos.slice(0, 10).map((repo: any) => (
                  <Link
                    key={repo.id}
                    href={`/repos/${repo.owner.name}/${repo.name}`}
                    className="flex flex-col text-sm text-fg hover:text-gh-blue p-2 rounded-md hover:bg-repo-hover transition-all group"
                  >
                    <div className="flex items-center truncate">
                      <div className="w-4 h-4 mr-2 bg-header border border-border-subtle rounded-sm flex-shrink-0 group-hover:border-gh-blue transition-colors"></div>
                      <span className="font-medium opacity-60">{repo.owner.name}</span>
                      <span className="text-gh-gray/40 mx-0.5">/</span>
                      <span className="font-bold">{repo.name}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-gh-gray italic px-1 pt-2">You haven't created any repositories yet.</p>
              )}
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1 space-y-8">
            <div className="gh-card p-8 bg-header mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                 <svg className="w-32 h-32 fill-current" viewBox="0 0 24 24">
                   <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
                 </svg>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2 tracking-tight">Welcome to WaiCode!</h3>
                <p className="text-gh-gray font-medium mb-6 max-w-lg">
                  This is your personalized developer feed. You'll see updates for repositories you participate in or follow.
                </p>
                <div className="flex items-center space-x-4">
                   <Link href="/repos/new" className="px-4 py-2 bg-canvas border border-border-subtle rounded-lg text-sm font-bold hover:bg-repo-hover shadow-sm border-b-2 transition-all">
                     Create your first project
                   </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <h2 className="text-xl font-bold mb-6 tracking-tight">Discover activity</h2>
               {allRepos.length > 0 ? (
                  allRepos.map((repo: any) => (
                    <div key={repo.id} className="gh-card p-6 hover:border-gh-blue group transition-all transform hover:-translate-y-0.5 duration-200">
                       <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center space-x-2">
                            <Link href={`/${repo.owner.name}`} className="text-sm font-bold text-gh-gray hover:text-gh-blue opacity-80">
                               {repo.owner.name}
                            </Link>
                            <span className="text-gh-gray/30">/</span>
                            <Link href={`/repos/${repo.owner.name}/${repo.name}`} className="text-lg font-bold text-gh-blue hover:underline">
                               {repo.name}
                            </Link>
                         </div>
                         <div className="flex items-center text-xs text-gh-gray space-x-4">
                            {repo.forkedFrom && (
                               <span className="flex items-center text-[10px] opacity-70">
                                  <GitFork className="w-3 h-3 mr-1" />
                                  {repo.forkedFrom.owner.name}/{repo.forkedFrom.name}
                               </span>
                            )}
                            <div className="flex items-center space-x-1.5 font-bold">
                               <svg className="w-4 h-4 text-yellow-500 fill-current opacity-80" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                               </svg>
                               <span>{repo._count.stars}</span>
                            </div>
                         </div>
                       </div>
                       <p className="text-sm text-gh-gray font-medium line-clamp-2 leading-relaxed">{repo.description || "No description provided."}</p>
                    </div>
                  ))
               ) : (
                  <div className="gh-card p-12 text-center text-gh-gray italic">
                     No recent activity to show in your network.
                  </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
