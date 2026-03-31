"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Search, Plus, Bell, ChevronDown, User, LogOut, Settings } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ repos: any[], users: any[] }>({ repos: [], users: [] });
  const [showResults, setShowResults] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        });
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const delayDebounce = setTimeout(() => {
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            setSearchResults(data);
            setShowResults(true);
          });
      }, 200);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults({ repos: [], users: [] });
      setShowResults(false);
    }
  }, [searchQuery]);

  return (
    <header className="gh-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center space-x-4 flex-1">
            <Link href="/" className="flex items-center space-x-2 text-fg hover:text-gh-blue transition-colors group">
               <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
               </svg>
               <span className="font-bold text-lg hidden sm:block">WaiCode</span>
            </Link>

            <div className="hidden lg:block relative max-w-sm w-full" ref={searchRef}>
               <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gh-gray group-focus-within:text-gh-blue" />
                 </div>
                 <input
                   type="text"
                   placeholder="Search or jump to..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                   className="w-full bg-header border border-border-subtle rounded-md py-1.5 pl-10 pr-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue transition-all"
                 />
                 <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <span className="text-[10px] font-mono text-gh-gray border border-border-subtle rounded px-1.5 bg-canvas">/</span>
                 </div>
               </div>

               {showResults && (searchResults.repos.length > 0 || searchResults.users.length > 0) && (
                 <div className="absolute mt-2 w-full bg-canvas border border-border-subtle rounded-lg shadow-2xl overflow-hidden py-2 z-[60]">
                    {searchResults.repos.length > 0 && (
                      <div className="px-4 py-2 text-xs font-bold text-gh-gray uppercase tracking-wider">Repositories</div>
                    )}
                    {searchResults.repos.map(repo => (
                      <Link
                        key={repo.id}
                        href={`/repos/${repo.owner.name}/${repo.name}`}
                        onClick={() => { setShowResults(false); setSearchQuery(""); }}
                        className="block px-4 py-2 text-sm text-fg hover:bg-repo-hover hover:text-gh-blue transition-colors"
                      >
                        <span className="opacity-60">{repo.owner.name}</span> / <span className="font-bold">{repo.name}</span>
                      </Link>
                    ))}
                    {searchResults.users.length > 0 && (
                      <div className="px-4 py-2 text-xs font-bold text-gh-gray uppercase tracking-wider mt-2 border-t border-border-muted pt-4">Users</div>
                    )}
                    {searchResults.users.map(user => (
                      <Link
                        key={user.id}
                        href={`/${user.name}`}
                        onClick={() => { setShowResults(false); setSearchQuery(""); }}
                        className="flex items-center px-4 py-2 text-sm text-fg hover:bg-repo-hover hover:text-gh-blue transition-colors"
                      >
                        <User className="w-4 h-4 mr-2 opacity-60" />
                        {user.name}
                      </Link>
                    ))}
                 </div>
               )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
             <ThemeToggle />
             {session ? (
               <>
                 <div className="hidden sm:flex items-center space-x-1">
                    <button className="p-2 text-gh-gray hover:text-gh-blue hover:bg-repo-hover rounded-lg transition-all">
                       <Plus className="w-5 h-5" />
                    </button>
                    <Link href="/notifications" className="relative p-2 text-gh-gray hover:text-gh-blue hover:bg-repo-hover rounded-lg transition-all">
                       <Bell className="w-5 h-5" />
                       {unreadCount > 0 && (
                         <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-header"></span>
                       )}
                    </Link>
                 </div>

                 <div className="relative ml-2" ref={menuRef}>
                    <button 
                       onClick={() => setShowProfileMenu(!showProfileMenu)}
                       className="flex items-center space-x-1 p-1 rounded-full hover:bg-repo-hover transition-all"
                    >
                       <div className="w-8 h-8 rounded-full bg-gh-blue flex items-center justify-center text-xs font-bold text-white ring-2 ring-border-subtle">
                          {session.user?.name?.[0].toUpperCase() || session.user?.email?.[0].toUpperCase()}
                       </div>
                       <ChevronDown className="w-4 h-4 text-gh-gray" />
                    </button>

                    {showProfileMenu && (
                       <div className="absolute right-0 mt-2 w-48 bg-canvas border border-border-subtle rounded-lg shadow-xl overflow-hidden z-[60] py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="px-4 py-3 border-b border-border-muted mb-1">
                             <p className="text-[10px] text-gh-gray uppercase font-bold tracking-wider">Signed in as</p>
                             <p className="text-sm font-bold truncate text-fg mt-0.5">{session.user?.name || session.user?.email}</p>
                          </div>
                          <Link href={`/${session.user?.name}`} className="flex items-center px-4 py-2 text-sm text-fg hover:bg-gh-blue hover:text-white transition-colors group">
                             <User className="w-4 h-4 mr-2 text-gh-gray group-hover:text-white" /> Your profile
                          </Link>
                          <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-fg hover:bg-gh-blue hover:text-white transition-colors group">
                             <Settings className="w-4 h-4 mr-2 text-gh-gray group-hover:text-white" /> Settings
                          </Link>
                          <button 
                             onClick={() => signOut()}
                             className="w-full flex items-center px-4 py-2 text-sm text-fg hover:bg-red-500 hover:text-white transition-colors border-t border-border-muted mt-1 group"
                          >
                             <LogOut className="w-4 h-4 mr-2 text-gh-gray group-hover:text-white" /> Sign out
                          </button>
                       </div>
                    )}
                 </div>
               </>
             ) : (
               <div className="flex items-center space-x-4">
                  <Link href="/auth/signin" className="text-sm font-semibold text-fg hover:text-gh-blue transition-colors">
                    Sign in
                  </Link>
                  <Link href="/auth/signup" className="text-sm font-bold bg-gh-blue text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-gh-blue/20">
                    Sign up
                  </Link>
               </div>
             )}
          </div>
        </div>
      </div>
    </header>
  );
}