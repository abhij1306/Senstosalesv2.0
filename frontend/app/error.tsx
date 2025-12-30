"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, H2, Body, SmallText, Button } from "@/components/design-system";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log to observability service in production
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-app-surface p-6">
            <Card className="max-w-md w-full p-10 text-center space-y-8 border-app-status-error/10 shadow-2xl shadow-app-status-error/5">
                <div className="flex justify-center">
                    <div className="p-6 bg-app-status-error/10 rounded-[2.5rem] border-2 border-app-status-error/20 text-app-status-error animate-bounce">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                </div>

                <div className="space-y-3">
                    <H2 className="uppercase tracking-tighter text-app-status-error">
                        Runtime Exception
                    </H2>
                    <Body className="font-black text-app-fg-muted uppercase tracking-widest">
                        {error.digest || "PROCESS TERMINATED"}
                    </Body>
                </div>

                <SmallText className="p-6 bg-app-surface-hover/50 rounded-2xl border-2 border-dashed border-app-border leading-relaxed text-app-fg-muted italic block">
                    {error.message ||
                        "The system encountered an unhandled exception during state reconciliation."}
                </SmallText>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="border-app-border/20"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        REBOOT HUB
                    </Button>
                    <Button
                        variant="default"
                        onClick={reset}
                        className="bg-app-status-error hover:bg-app-status-error/90"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        RETRY SYNC
                    </Button>
                </div>
            </Card>
        </div>
    );
}
