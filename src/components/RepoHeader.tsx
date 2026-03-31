"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { StarButton } from "./StarButton";
import { ForkButton } from "./ForkButton";
import { GitFork, Eye, Star, Settings, Code, CircleDot, GitPullRequest } from "lucide-react";

interface RepoHeaderProps {
  owner: string;
  repo: string;
  forkedFrom?: { owner: string; name: string } | null;
}

export function RepoHeader({ owner, repo, forkedFrom }: RepoHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isOwner = session?.user?.name === owner;

  const tabs = [
    { name: "Code", href: `/repos/${owner}/${repo}`, icon: Code, pattern: /^\/repos\/[^/]+\/[^/]+(\/blob\/.*|\/tree\/.*|\/new-file|\/edit\/.*)?$/ },
    { name: "Issues", href: `/repos/${owner}/${repo}/issues`, icon: CircleDot, pattern: /^\/repos\/[^/]+\/[^/]+\/issues(\/.*)?$/ },
    { name: "Pull requests", href: `/repos/${owner}/${repo}/pulls`, icon: GitPullRequest, pattern: /^\/repos\/[^/]+\/[^/]+\/pulls(\/.*)?$/ },
    { name: "Actions", href: `/repos/${owner}/${repo}/actions`, icon: Code, pattern: /^\/repos\/[^/]+\/[^/]+\/actions(\/.*)?$/ },
  ];

  if (isOwner) {
    tabs.push({ name: "Settings", href: `/repos/${owner}/${repo}/settings`, icon: Settings, pattern: /^\/repos\/[^/]+\/[^/]+\/settings(\/.*)?$/ });
  }

  return (
    <div className="bg-header border-b border-border-subtle pt-6">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 text-xl">
              <Link href={`/${owner}`} className="text-gh-blue hover:underline">
                {owner}
              </Link>
              <span className="text-gh-gray/40 font-light">/</span>
              <Link href={`/repos/${owner}/${repo}`} className="text-gh-blue hover:underline font-bold">
                {repo}
              </Link>
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-canvas text-gh-gray border border-border-subtle shadow-sm uppercase tracking-wider">
                Public
              </span>
            </div>
            {forkedFrom && (
              <p className="text-[10px] text-gh-gray mt-1">
                forked from <Link href={`/repos/${forkedFrom.owner}/${forkedFrom.name}`} className="text-gh-blue hover:underline">{forkedFrom.owner}/{forkedFrom.name}</Link>
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
             <button className="flex items-center px-3 py-1.5 text-xs font-bold bg-canvas text-fg border border-border-subtle rounded-lg hover:bg-repo-hover transition-all shadow-sm border-b-2">
                <Eye className="w-4 h-4 mr-2 text-gh-gray" />
                Watch
             </button>
             <ForkButton owner={owner} repo={repo} />
             <StarButton owner={owner} repo={repo} />
          </div>
        </div>

        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const isActive = tab.pattern.test(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center px-4 pb-3 text-sm font-medium border-b-2 transition-all space-x-2 ${
                  isActive
                    ? "border-[#fd8c73] text-fg"
                    : "border-transparent text-gh-gray hover:text-fg hover:border-border-subtle"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-fg' : 'text-gh-gray'}`} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}