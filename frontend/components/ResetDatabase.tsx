"use client";
import { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ResetDatabase() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        setIsResetting(true);
        try {
            const response = await fetch("/api/system/reset-db", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                alert(
                    `✅ ${data.message}\n\nTables cleared: ${data.tables_cleared.length}\nPreserved: ${data.preserved.join(",")}`
                );
                window.location.href = "/"; // Redirect to home
            } else {
                const error = await response.json();
                alert(`❌ Reset failed: ${error.detail}`);
            }
        } catch (err) {
            alert(`❌ Network error: ${err}`);
        } finally {
            setIsResetting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="p-4 border border-red-300 bg-sys-error-subtle rounded-lg">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-sys-error shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-bold text-sys-error">Danger Zone</h3>
                    <p className="text-sys-error mt-1">
                        Reset database will <strong>permanently delete</strong> all business
                        data (POs, DCs, Invoices, SRVs). Master tables (HSN, Consignees)
                        will be preserved. <strong>This action cannot be undone!</strong>
                    </p>

                    {!showConfirm ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="mt-3 px-4 py-2 bg-sys-error text-sys-bg-white font-bold rounded hover:bg-sys-error transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" /> Reset Database
                        </button>
                    ) : (
                        <div className="mt-3 p-3 bg-sys-bg-white border-2 border-sys-error rounded shadow-sm">
                            <p className="font-bold text-sys-error mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Are you absolutely sure?
                                This will delete ALL business data!
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleReset}
                                    disabled={isResetting}
                                    className="px-4 py-2 bg-sys-error text-sys-bg-white font-bold rounded hover:bg-sys-error disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {isResetting ? (
                                        <>
                                            <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />{" "}
                                            Resetting...
                                        </>
                                    ) : (
                                        "Yes, Reset Now"
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isResetting}
                                    className="px-4 py-2 bg-sys-tertiary/20 text-sys-primary font-bold rounded hover:bg-sys-tertiary disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
