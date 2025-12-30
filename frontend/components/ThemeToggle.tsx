"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState, useEffect } from "react";

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
    <div className="theme-toggle-container">
      <div className="theme-toggle-track">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`theme-toggle-btn ${theme === value ? "active" : ""}`}
            aria-label={`Switch to ${label} theme`}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <style jsx>{`
        .theme-toggle-container {
          display: inline-flex;
          padding: 0.25rem;
          background: var(--color-sys-surface-glass);
          backdrop-filter: var(--sys-effect-blur-glass);
          border: 1px solid var(--color-sys-surface-glass_border);
          border-radius: 0.75rem;
          box-shadow: var(--shadow-sm);
        }
        .theme-toggle-track {
          display: flex;
          gap: 0.25rem;
        }
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: transparent;
          border: none;
          color: var(--color-sys-text-secondary);
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .theme-toggle-btn:hover {
          background: var(--color-sys-surface-glass);
          color: var(--color-sys-text-primary);
          transform: scale(1.05);
        }
        .theme-toggle-btn.active {
          background: var(--color-sys-brand-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .theme-toggle-btn.active:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        @media (prefers-reduced-motion: reduce) {
          .theme-toggle-btn {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}