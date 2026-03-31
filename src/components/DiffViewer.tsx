"use client";

import { createPatch } from "diff";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";

interface DiffViewerProps {
  fileName: string;
  oldCode: string;
  newCode: string;
}

export function DiffViewer({ fileName, oldCode, newCode }: DiffViewerProps) {
  const patch = createPatch(fileName, oldCode, newCode);
  const lines = patch.split("\n").slice(4); // Remove patch header

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-6">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
         <span className="text-xs font-mono font-semibold text-gray-700">{fileName}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <tbody>
            {lines.map((line, i) => {
              let bgColor = "bg-white";
              let textColor = "text-gray-900";
              let prefix = " ";
              
              if (line.startsWith("+")) {
                bgColor = "bg-green-50";
                textColor = "text-green-700";
              } else if (line.startsWith("-")) {
                bgColor = "bg-red-50";
                textColor = "text-red-700";
              } else if (line.startsWith("@@")) {
                bgColor = "bg-indigo-50";
                textColor = "text-indigo-400";
              }

              return (
                <tr key={i} className={`${bgColor} hover:bg-opacity-80 transition-colors`}>
                  <td className="w-10 px-2 py-0.5 border-r border-gray-100 text-right select-none text-gray-300">
                    {i + 1}
                  </td>
                  <td className={`px-4 py-0.5 whitespace-pre ${textColor}`}>
                    {line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}