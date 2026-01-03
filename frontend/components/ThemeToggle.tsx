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
    <div className="inline-flex p-1 bg-surface-variant/30 backdrop-blur-md rounded-xl border-none shadow-sm">
      <div className="flex gap-1">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center justify-center p-2 rounded-lg transition-all duration-300 relative group will-change-transform",
              theme === value
                ? "text-action-primary-fg shadow-lg shadow-action-primary/20 scale-105 active-glow"
                : "text-text-tertiary hover:bg-surface-variant/50 hover:text-text-primary"
            )}
            aria-label={`Switch to ${label} theme`}
            title={label}
          >
            <Icon size={16} className={cn("transition-transform duration-300", theme === value && "scale-110")} />
            {theme === value && (
              <motion.div
                layoutId="theme-active"
                className="absolute inset-0 bg-action-primary rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}