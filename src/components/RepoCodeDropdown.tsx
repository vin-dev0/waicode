"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Clipboard, Link as LinkIcon, ChevronDown, Check } from "lucide-react";

interface RepoCodeDropdownProps {
  owner: string;
  repo: string;
}

export function RepoCodeDropdown({ owner, repo }: RepoCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cloneUrl = typeof window !== "undefined" ? `${window.location.origin}/api/git/${owner}/${repo}` : `/api/git/${owner}/${repo}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cloneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gh-green shadow-lg text-sm font-bold rounded-lg text-white bg-gh-green hover:opacity-90 transition-all border-b-2"
      >
        <Download className="w-4 h-4 mr-2" />
        Code
        <ChevronDown className={`w-3.5 h-3.5 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 bg-canvas border border-border-subtle rounded-xl shadow-2xl z-50 p-6 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-2 mb-4">
              <LinkIcon className="w-4 h-4 text-gh-blue" />
              <span className="text-[10px] font-black text-fg uppercase tracking-widest">Clone with HTTPS</span>
            </div>
            
            <div className="flex items-center bg-header border border-border-subtle rounded-lg px-3 py-2 mb-4 group hover:border-gh-blue transition-colors relative overflow-hidden">
              <code className="text-[10px] font-mono text-gh-gray flex-1 truncate pr-8">
                {cloneUrl}
              </code>
              <button 
                onClick={handleCopy}
                className="absolute right-1 text-gh-gray hover:text-gh-blue transition-all p-1.5 rounded-md hover:bg-canvas bg-header"
              >
                {copied ? <Check className="w-4 h-4 text-gh-green" /> : <Clipboard className="w-4 h-4" />}
              </button>
            </div>
            
            <p className="text-[10px] text-gh-gray font-medium mb-6 pb-6 border-b border-border-muted leading-relaxed uppercase tracking-wider">
              Use this target URL to clone or push to this repository manually via git CLI.
            </p>
            
            <Link 
              href={`/api/repos/${owner}/${repo}/download`}
              className="flex items-center text-sm text-fg hover:text-gh-blue font-bold group transition-all p-3 -mx-3 rounded-lg hover:bg-repo-hover"
            >
              <Download className="w-5 h-5 mr-3 text-gh-gray group-hover:text-gh-blue transition-all" />
              Download ZIP
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
