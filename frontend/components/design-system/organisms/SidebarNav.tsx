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
import { Caption1, Body, Headline, Footnote } from "../atoms/Typography";

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
    <aside className="w-64 flex-shrink-0 flex flex-col tahoe-glass z-20 m-4 ml-4 rounded-[24px] overflow-hidden">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-system-blue to-system-cyan rounded-xl elevation-1 flex items-center justify-center text-white">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <Body className="leading-tight text-text-primary">Sensto Sales</Body>
            <Caption2 className="text-text-secondary opacity-90 leading-tight">Pro Enterprise</Caption2>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <Caption1 className="px-3 mb-2 pl-4 text-text-tertiary tracking-wide uppercase opacity-80">
              {group.label}
            </Caption1>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));

                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3.5 py-2 rounded-xl transition-all duration-200 group relative active:scale-[0.98] z-10",
                        isActive
                          ? "text-system-blue"
                          : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-selection-capsule"
                          className="absolute inset-0 bg-gradient-to-r from-system-blue/15 via-system-blue/10 to-system-blue/5 backdrop-blur-xl rounded-xl shadow-lg shadow-system-blue/20"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--system-blue) / 0.18), hsl(var(--system-blue) / 0.08))"
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                            mass: 0.8
                          }}
                        />
                      )}
                      <item.icon
                        size={18}
                        className={cn(
                          "mr-3 transition-colors relative z-10",
                          isActive ? "text-system-blue" : "text-text-tertiary group-hover:text-text-primary"
                        )}
                      />
                      <Body className={cn("text-[14px] transition-colors relative z-10", isActive ? "text-system-blue font-medium" : "text-inherit")}>
                        {item.name}
                      </Body>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Premium Profile Footer */}
      <div className="p-4">
        <div className="flex items-center p-3 bg-white/5 dark:bg-black/5 rounded-xl transition-smooth active:scale-[0.98] group cursor-pointer hover:bg-white/10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 text-white flex items-center justify-center text-xs shadow-md elevation-1">
            <span>AS</span>
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <Footnote className="text-text-primary truncate">Abhijit S.</Footnote>
            <div className="flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-system-green mr-1.5 opacity-80"></span>
              <Caption2 className="text-text-secondary truncate">Administrator</Caption2>
            </div>
          </div>
          <Settings size={18} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
        </div>
      </div>
    </aside>
  );
}

import { Caption2 } from "../atoms/Typography";
