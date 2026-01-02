"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
    url: string;
    filename: string;
    label?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export const DownloadButton = ({
    url,
    filename,
    label = "Download",
    variant = "secondary",
    size = "sm",
    className,
}: DownloadButtonProps) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Download Error:", error);
            alert("Failed to download file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn(
                "font-black text-[10px] uppercase tracking-widest gap-2",
                variant === "secondary" && "bg-app-overlay/10 border-app-border/30 text-app-fg hover:bg-app-overlay/20",
                className
            )}
        >
            {isDownloading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <Download className="w-3 h-3" />
            )}
            {label}
        </Button>
    );
};
