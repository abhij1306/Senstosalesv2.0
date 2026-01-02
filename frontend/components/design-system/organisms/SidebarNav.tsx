"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Receipt,
  FileText,
  Settings,
  ChevronRight,
  Package,
  Activity,
  Box,
  Users,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navGroups = [
  {
    label: "Intelligence",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Reports", href: "/reports", icon: BarChart3 },
    ]
  },
  {
    label: "Operations",
    items: [
      { name: "Purchase Order", href: "/po", icon: ShoppingCart },
      { name: "Delivery Challan", href: "/dc", icon: Truck },
      { name: "Invoice", href: "/invoice", icon: Receipt },
      { name: "SRV Ingestion", href: "/srv", icon: Box },
    ]
  },
  {
    label: "Configuration",
    items: [
      { name: "PO Notes", href: "/po-notes", icon: FileText },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="w-[270px] bg-app-sidebar h-full flex flex-col z-50 shrink-0 relative overflow-hidden font-heading rounded-none border-none">

      {/* Brand Header - Compacted */}
      <div className="p-6 pb-2 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-app-accent flex items-center justify-center shadow-lg shadow-app-accent/20">
            <Package className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-md font-bold text-app-fg tracking-tight leading-none uppercase">
              SENSTO<span className="text-app-accent">SALES</span>
            </span>
            <span className="text-[8px] font-bold text-app-fg/40 mt-1 uppercase tracking-[0.3em]">
              PRO ENTERPRISE
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Groups - Densified */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar relative z-10">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <h3 className="px-3 text-[9px] font-bold text-app-fg/40 uppercase tracking-[0.3em] mb-2">
              {group.label}
            </h3>
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 relative z-10",
                    isActive
                      ? "text-app-accent"
                      : "text-app-fg/60 hover:text-app-fg"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-x-2 inset-y-1 active-glow-soft rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  <div className="flex items-center gap-3 relative z-10 pl-2">
                    <item.icon
                      className={cn(
                        "w-4 h-4 transition-all duration-200",
                        isActive
                          ? "text-app-accent"
                          : "text-app-fg/40 group-hover:text-app-fg/70"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-bold tracking-wider uppercase",
                        isActive ? "text-app-accent" : "text-app-fg/60 group-hover:text-app-fg"
                      )}
                    >
                      {item.name}
                    </span>
                  </div>

                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-[var(--color-sys-brand-primary)] opacity-100" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Premium Profile Footer */}
      <div className="p-4 shrink-0 mt-auto relative z-10">
        <div className="p-2.5 bg-app-fg/5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-app-accent/10 flex items-center justify-center text-app-accent font-black text-[11px]">
              AS
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-bold text-app-fg truncate">Abhijit S.</span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[7px] font-bold text-app-fg/40 uppercase tracking-widest truncate">Administrator</span>
              </div>
            </div>
            <div className="p-1.5 hover:bg-app-fg/10 rounded-lg transition-colors cursor-pointer text-app-fg/40 hover:text-app-fg">
              <Settings size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
