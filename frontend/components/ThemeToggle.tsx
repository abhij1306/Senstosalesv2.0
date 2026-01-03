"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="inline-flex p-1 bg-surface-sunken/80 backdrop-blur-md rounded-full border border-white/40 shadow-inner">
      <div className="flex gap-0.5">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 relative group",
              theme === value
                ? "text-white active-glow"
                : "text-text-tertiary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"
            )}
            aria-label={`Switch to ${label} theme`}
            title={label}
          >
            <Icon size={14} className="relative z-10" />
          </button>
        ))}
      </div>
    </div>
  );
}