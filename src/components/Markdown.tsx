"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-a:text-gh-blue hover:prose-a:underline prose-img:rounded-md prose-headings:font-black prose-headings:tracking-tight prose-code:text-gh-blue prose-code:bg-header prose-code:px-1 prose-code:rounded">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}