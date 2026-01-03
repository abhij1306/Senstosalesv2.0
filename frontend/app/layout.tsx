import type { Metadata } from "next";
import "./globals.css";
import "@/components/design-system/tokens/primitives.css";
import "@/components/design-system/tokens/semantic.css";
import "@/components/design-system/tokens/component.css";
import { SidebarNav as Sidebar } from "@/components/design-system/organisms/SidebarNav";
import { UploadProvider } from "@/components/providers/UploadContext";
import BatchUploadCard from "@/components/global/BatchUploadCard";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Providers } from "./providers";
import { GlobalSearch } from "@/components/design-system/organisms";
import { Breadcrumbs } from "@/components/design-system/atoms";
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter";

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
            <body className="font-sans antialiased text-app-fg">
                <WebVitalsReporter />
                <Providers>
                    {/* 
                      Sonoma Wallpaper Background
                      - Uses a high-quality abstract gradient or image simulating the Sonoma look
                      - Serves as the backdrop for all glassmorphic elements
                    */}
                    <div className="flex h-screen bg-transparent overflow-hidden relative">
                        {/* 
                          Sonoma Abstract Wallpaper 
                          - Deep layer background to provide depth for glass elements
                        */}
                        <div className="fixed inset-0 -z-50 pointer-events-none opacity-50 dark:opacity-30 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#6366f1]/10 via-[#a855f7]/5 to-[#ec4899]/10" />
                            <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-blue-400/15 blur-[80px]" />
                            <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-purple-400/15 blur-[80px]" />
                        </div>

                        {/* Standardized Non-collapsible Sidebar - Deepest Layer */}
                        <Sidebar />

                        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
                            {/* Floating Header Bar */}
                            <header className="h-[72px] flex items-center justify-between px-8 z-30 transition-all duration-300">
                                <div className="flex items-center gap-8 flex-1">
                                    {/* Breadcrumbs for cognition support */}
                                    <div className="hidden xl:block min-w-max">
                                        <Breadcrumbs />
                                    </div>

                                    {/* Master Search Bar - Capsule Style */}
                                    <div className="flex-1 max-w-2xl">
                                        <GlobalSearch />
                                    </div>
                                </div>

                                {/* Right Header Actions */}
                                <div className="flex items-center gap-4 ml-8">
                                    <ThemeToggle />
                                    <div id="header-action-portal" />
                                </div>
                            </header>

                            {/* Main Content Area - Mid Elevation */}
                            <main
                                className="flex-1 overflow-y-auto px-8 pt-2 pb-8 scroll-smooth no-scrollbar"
                            >
                                <div className="mx-auto max-w-[1400px] w-full relative">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                    <BatchUploadCard />
                </Providers>
            </body>
        </html>
    );
}
