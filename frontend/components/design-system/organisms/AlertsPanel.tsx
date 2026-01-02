"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { api } from "@/lib/api";

interface Alert {
    id: string;
    alert_type: string;
    entity_type: string;
    entity_id: string;
    message: string;
    severity: string;
    is_acknowledged: boolean;
    created_at: string;
}

export default function AlertsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const panelRef = useRef<HTMLDivElement>(null);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const data = await api.listAlerts(); // Updated from getAlerts
            setAlerts(data);
            setUnreadCount(data.length);
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleAcknowledge = async (alertId: string) => {
        try {
            await api.acknowledgeAlert(alertId);
            fetchAlerts();
        } catch (error) {
            console.error("Failed to acknowledge alert:", error);
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "error":
                return <AlertTriangle className="w-5 h-5 text-app-status-error" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-app-status-warning" />;
            case "info":
                return <Info className="w-5 h-5 text-app-accent" />;
            default:
                return <Info className="w-5 h-5 text-app-fg-muted" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "error":
                return "bg-app-status-error/10 border-app-status-error/20";
            case "warning":
                return "bg-app-status-warning/10 border-app-status-warning/20";
            case "info":
                return "bg-app-accent/10 border-app-accent/20";
            default:
                return "bg-app-overlay border-app-border/20";
        }
    };

    return (
        <>
            {/* Alert Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-app-fg-muted hover:text-app-fg hover:bg-app-overlay rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-app-status-error text-white font-bold rounded-full flex items-center justify-center text-[10px]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Alerts Panel */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-app-overlay/40 backdrop-blur-sm z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed top-16 right-4 w-96 bg-app-surface border border-app-border rounded-2xl shadow-app-spotlight z-50 max-h-[600px] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-app-border flex items-center justify-between bg-app-surface/80 backdrop-blur-xl">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-app-fg" />
                                <h3 className="font-bold text-app-fg uppercase tracking-tight">Alerts</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-app-status-error/10 text-app-status-error font-bold rounded-full text-[10px]">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-app-overlay p-1 rounded-full transition-colors">
                                <X className="w-5 h-5 text-app-fg-muted hover:text-app-fg" />
                            </button>
                        </div>

                        {/* Alerts List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {loading && (
                                <div className="text-center py-12 text-app-fg-muted">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-medium uppercase tracking-widest">Scanning Network...</p>
                                </div>
                            )}
                            {!loading && alerts.length === 0 && (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-12 h-12 text-app-status-success mx-auto mb-4 opacity-50" />
                                    <div className="text-app-fg font-bold uppercase tracking-tight mb-1">Station Clear</div>
                                    <div className="text-app-fg-muted text-xs">No pending operations require attention</div>
                                </div>
                            )}
                            {!loading && alerts.length > 0 && (
                                <div className="space-y-3">
                                    {alerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${getSeverityColor(
                                                alert.severity
                                            )}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getSeverityIcon(alert.severity)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-app-fg text-sm mb-1 leading-tight">
                                                        {alert.message}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-app-fg-muted font-bold uppercase tracking-wider">
                                                        <span className="px-2 py-0.5 bg-app-surface/50 rounded-md border border-app-border">
                                                            {alert.entity_type}
                                                        </span>
                                                        <span>
                                                            {new Date(alert.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAcknowledge(alert.id)}
                                                    className="flex-shrink-0 p-1.5 hover:bg-app-surface/80 rounded-full transition-colors group"
                                                    title="Acknowledge"
                                                >
                                                    <X className="w-4 h-4 text-app-fg-muted group-hover:text-app-status-error" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {alerts.length > 0 && (
                            <div className="px-6 py-3 border-t border-app-border bg-app-overlay/20 text-app-fg-muted text-[10px] text-center font-bold uppercase tracking-widest">
                                Acknowledge alerts to dismiss from deck
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    );
}

import { Loader2 } from "lucide-react";
