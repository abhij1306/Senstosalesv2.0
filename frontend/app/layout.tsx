import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SidebarNav as Sidebar } from "@/components/design-system/organisms/SidebarNav";
// Header import removed
// Link to toaster removed as component not found
// import { Toaster } from "@/components/ui/toaster";
import { UploadProvider } from "@/components/providers/UploadContext";
import BatchUploadCard from "@/components/global/BatchUploadCard";
import { cn } from "@/lib/utils";
// Header import removed
import PageTransition from "@/components/PageTransition";
import { ThemeToggle } from "@/components/ThemeToggle";

import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { Providers } from "./providers";
import dynamic from "next/dynamic";

const GlobalSearch = dynamic(
    () => import("@/components/design-system/organisms/GlobalSearch").then(mod => ({ default: mod.default })),
    {
        loading: () => (
            <div className="h-10 w-full max-w-[700px] bg-app-bg/50 backdrop-blur-2xl rounded-full animate-pulse" />
        ),
        ssr: false,
    }
);

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const mono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
    display: "swap"
});

export const metadata: Metadata = {
    title: "SenstoSales",
    description: "Enterprise Procurement Management System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(inter.variable, outfit.variable, mono.variable, "font-sans antialiased")}>
                <Providers>
                    <UploadProvider>
                        <div className="flex h-screen bg-background overflow-hidden relative">
                            {/* Standardized Non-collapsible Sidebar */}
                            <Sidebar />

                            <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
                                {/* Optimized Master Header - Premium Glass Standard */}
                                <header className="glass-header px-12 py-3 flex items-center gap-8 shrink-0">
                                    {/* Master Search Bar (Flush Left/Center) */}
                                    <div className="flex-1 max-w-4xl">
                                        <GlobalSearch />
                                    </div>

                                    {/* Right Header: Contextual Actions */}
                                    <div className="flex items-center gap-6">
                                        <ThemeToggle />
                                        {/* Portal for page-specific header actions (like Date Range) */}
                                        <div id="header-action-portal" />
                                    </div>
                                </header>



                                {/* Main Content Area - Shifted Up */}
                                <main className="flex-1 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20 px-12 pb-32 pt-6">
                                    <div className="mx-auto max-w-[1400px] w-full relative min-h-[calc(100vh-140px)]">
                                        <PageTransition>{children}</PageTransition>
                                    </div>
                                </main>
                            </div>
                        </div>
                        <BatchUploadCard />
                    </UploadProvider>
                    <WebVitalsReporter />
                </Providers>
            </body>
        </html>
    );
}
