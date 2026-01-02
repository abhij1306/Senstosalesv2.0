"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, H3, Body } from "@/components/design-system";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 * Logs errors for debugging
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console
        // console.error("Error caught by boundary:", error, errorInfo);
        // Store error info in state
        this.setState({ errorInfo });
        // TODO: Send to error tracking service (e.g., Sentry)
        // sendErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex items-center justify-center min-h-screen bg-app-surface">
                    <Card className="max-w-md w-full p-8 shadow-app-spotlight border border-app-border/50 bg-app-surface/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-app-status-error/10 flex items-center justify-center text-app-status-error shadow-sm">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <H3 className="text-xl">System Exception</H3>
                        </div>
                        <Body className="text-app-fg-muted mb-6">
                            We encountered an unexpected error while processing your request. Please attempt to retry or return home.
                        </Body>
                        {this.state.error && (
                            <div className="bg-app-overlay/5 border border-app-status-error/20 rounded-xl p-4 mb-6">
                                <p className="font-mono text-xs text-app-status-error break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        {process.env.NODE_ENV === "development" &&
                            this.state.errorInfo && (
                                <details className="mb-6 group">
                                    <summary className="text-[10px] font-black uppercase tracking-widest text-app-fg-muted cursor-pointer hover:text-app-fg transition-colors">
                                        Stack Trace (Dev Only)
                                    </summary>
                                    <pre className="mt-3 bg-app-overlay/10 p-4 rounded-xl overflow-auto max-h-48 text-[10px] font-mono text-app-fg/80 border border-app-border/20">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        <div className="flex gap-4">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 h-10 flex items-center justify-center rounded-xl bg-app-accent text-white font-black text-[11px] uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-95 active-glow"
                            >
                                Retry Action
                            </button>
                            <button
                                onClick={() => (window.location.href = "/")}
                                className="flex-1 h-10 flex items-center justify-center rounded-xl bg-app-overlay/10 text-app-fg font-black text-[11px] uppercase tracking-widest border border-app-border/20 hover:bg-app-overlay/20 transition-all active:scale-95"
                            >
                                Back to Home
                            </button>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
