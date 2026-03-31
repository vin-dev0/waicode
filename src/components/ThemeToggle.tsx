"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-9 h-9" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-repo-hover transition-all text-gh-gray hover:text-gh-blue"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-[1.25rem] h-[1.25rem] transition-all" />
      ) : (
        <Sun className="w-[1.25rem] h-[1.25rem] transition-all" />
      )}
    </button>
  );
}
