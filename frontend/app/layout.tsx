import type { Metadata } from "next";
import { Inter, Roboto, Public_Sans } from "next/font/google";
import "./globals.css";
import { SidebarNav as Sidebar } from "@/components/design-system/organisms/SidebarNav";
import { UploadProvider } from "@/components/providers/UploadContext";
import BatchUploadCard from "@/components/global/BatchUploadCard";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/PageTransition";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { Providers } from "./providers";
import { GlobalSearch } from "@/components/design-system/organisms";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const roboto = Roboto({
    weight: ["400", "500", "700", "900"],
    subsets: ["latin"],
    variable: "--font-roboto",
    display: "swap",
});

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--font-public-sans",
    display: "swap",
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
            <body className={cn(
                inter.variable,
                roboto.variable,
                publicSans.variable,
                "font-sans antialiased"
            )}>
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
                                <main
                                    className="flex-1 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20 pb-32"
                                    style={{ paddingLeft: 'var(--page-padding-x)', paddingRight: 'var(--page-padding-x)', paddingTop: 'var(--page-padding-y)' }}
                                >
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
