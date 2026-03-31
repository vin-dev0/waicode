"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  code: string;
  language?: string;
}

export function CodeViewer({ code, language = "javascript" }: CodeViewerProps) {
  return (
    <div className="overflow-hidden border-t border-gray-200 bg-white">
      <SyntaxHighlighter
        language={language}
        style={prism}
        customStyle={{ 
          margin: 0, 
          padding: "1rem", 
          fontSize: "12px", 
          lineHeight: "1.5",
          backgroundColor: "#ffffff"
        }}
        showLineNumbers={true}
        lineNumberStyle={{ 
          minWidth: "3em", 
          paddingRight: "1em", 
          color: "#adb5bd", 
          textAlign: "right",
          userSelect: "none"
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}