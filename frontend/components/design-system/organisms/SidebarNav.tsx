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
    <aside className="w-72 flex-shrink-0 flex flex-col tahoe-glass !bg-white/20 dark:!bg-black/20 z-20 m-4 ml-4 rounded-[24px] overflow-hidden border-white/20">
      {/* Brand Header */}
      <div className="h-24 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-system-blue to-system-cyan rounded-[12px] shadow-lg flex items-center justify-center text-white ring-1 ring-white/20">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex flex-col justify-center">
            <Headline className="leading-tight text-vibrancy font-semibold">Sensto Sales</Headline>
            <Caption1 className="text-text-secondary opacity-90 leading-tight mt-0.5 font-medium">Pro Enterprise</Caption1>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-9 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <Caption1 className="px-3 mb-3 pl-4 text-text-tertiary font-medium tracking-wide uppercase opacity-80">
              {group.label}
            </Caption1>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative active:scale-[0.98] shadow-sm backdrop-blur-sm",
                        isActive
                          ? "bg-system-blue/15 text-system-blue font-semibold"
                          : "text-text-secondary hover:bg-white/40 dark:hover:bg-white/10 hover:text-text-primary hover:shadow-sm"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-[20px] h-[20px] mr-3 transition-colors",
                          isActive ? "text-system-blue" : "text-text-tertiary group-hover:text-text-primary"
                        )}
                      />
                      <Body className={cn("text-[15px] transition-colors", isActive ? "text-system-blue font-semibold" : "text-inherit font-medium")}>
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
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center p-3 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-[16px] shadow-sm border border-white/10 cursor-pointer hover:bg-white/20 transition-smooth active:scale-[0.98] group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-system-gray to-slate-400 text-white flex items-center justify-center font-semibold text-sm shadow-inner ring-2 ring-white/10">
            <span>AS</span>
          </div>
          <div className="ml-3.5 flex-1 overflow-hidden">
            <Footnote className="font-semibold text-text-primary truncate">Abhijit S.</Footnote>
            <div className="flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-system-green mr-1.5 shadow-[0_0_6px_rgba(var(--system-green-rgb),0.8)]"></span>
              <Caption2 className="text-text-secondary truncate font-medium">Administrator</Caption2>
            </div>
          </div>
          <Settings className="w-5 h-5 text-text-tertiary group-hover:text-text-primary transition-colors" />
        </div>
      </div>
    </aside>
  );
}

import { Caption2 } from "../atoms/Typography";
