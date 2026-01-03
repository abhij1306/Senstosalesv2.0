"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footnote } from "./Typography";

export function Breadcrumbs() {
    const pathname = usePathname();
    const paths = pathname.split("/").filter(Boolean);

    if (pathname === "/") return null;

    return (
        <nav className="flex items-center space-x-2 text-text-tertiary">
            <Link
                href="/"
                className="hover:text-brand-primary transition-colors p-1 rounded-md hover:bg-brand-primary/5"
            >
                <Home size={14} />
            </Link>

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join("/")}`;
                const isLast = index === paths.length - 1;
                const label = path === "po" ? "Purchase Orders" :
                    path === "dc" ? "Delivery Challans" :
                        path === "invoice" ? "GST Invoices" :
                            path.charAt(0).toUpperCase() + path.slice(1);

                return (
                    <div key={path} className="flex items-center space-x-2">
                        <ChevronRight size={12} className="opacity-50" />
                        <Link
                            href={href}
                            className={cn(
                                "hover:text-brand-primary transition-colors px-1.5 py-0.5 rounded-md text-[13px] tracking-tight",
                                isLast ? "text-text-primary font-semibold pointer-events-none" : "hover:bg-brand-primary/5"
                            )}
                        >
                            {label}
                        </Link>
                    </div>
                );
            })}
        </nav>
    );
}
