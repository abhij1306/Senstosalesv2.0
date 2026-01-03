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
  Package,
  BarChart3,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Caption1, Body, Footnote } from "../atoms/Typography";

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
      { name: "GST Invoices", href: "/invoice", icon: Receipt },
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
    <aside className="w-64 flex-shrink-0 flex flex-col tahoe-glass-card z-20 m-4 ml-4 rounded-[32px] overflow-hidden border-none transition-smooth backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[rgb(var(--action-primary))] rounded-xl elevation-1 flex items-center justify-center text-white shadow-lg shadow-[rgb(var(--action-primary))]/20">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="leading-tight text-text-primary font-bold tracking-tight text-lg">Senstosales</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Subheaders removed per user request */}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));

                return (
                  <li key={item.href} className="relative px-2">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-xl transition-all duration-200 group relative z-10",
                        "text-[13px] tracking-tight",
                        isActive
                          ? "sidebar-item-active"
                          : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"
                      )}
                    >
                      <item.icon
                        size={18}
                        className={cn(
                          "mr-3 transition-colors",
                          isActive ? "text-[rgb(var(--action-primary))]" : "text-text-tertiary group-hover:text-text-primary"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className={cn(isActive && "font-semibold")}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

    </aside>
  );
}

import { Caption2 } from "../atoms/Typography";
