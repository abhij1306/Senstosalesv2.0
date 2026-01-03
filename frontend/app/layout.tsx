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
                <Providers>
                    {/* 
                      Sonoma Wallpaper Background
                      - Uses a high-quality abstract gradient or image simulating the Sonoma look
                      - Serves as the backdrop for all glassmorphic elements
                    */}
                    <div className="flex h-screen bg-transparent overflow-hidden relative">
                        {/* Standardized Non-collapsible Sidebar */}
                        <Sidebar />

                        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
                            {/* Tahoe Header */}
                            <header className="h-16 flex items-center justify-between px-8 py-3 z-10 header-glass">
                                {/* Master Search Bar */}
                                <div className="flex-1 max-w-xl">
                                    <GlobalSearch />
                                </div>

                                {/* Right Header: Contextual Actions */}
                                <div className="flex items-center gap-5 ml-8">
                                    <ThemeToggle />
                                    <div id="header-action-portal" />
                                </div>
                            </header>

                            {/* Main Content Area */}
                            <main
                                className="flex-1 overflow-y-auto px-8 pt-6 pb-6 scroll-smooth no-scrollbar"
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
