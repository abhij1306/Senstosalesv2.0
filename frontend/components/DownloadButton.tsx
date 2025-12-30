import React, { useState } from "react";
import { Download } from "lucide-react";

interface DownloadButtonProps {
    url: string;
    filename: string;
    label?: string;
    className?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export default function DownloadButton({
    url,
    filename,
    label = "Download Excel",
    className = "",
    variant = "outline",
    size = "md",
}: DownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);

        try {
            const response = await fetch(url, {
                method: "GET",
            });

            if (!response.ok) {
                let errorMessage = "Download failed";
                try {
                    const errorData = await response.json();
                    // Handle both standard FastAPI detail and our structured AppException
                    errorMessage =
                        errorData.message ||
                        errorData.detail?.message ||
                        errorData.detail ||
                        errorMessage;
                } catch {
                    // Not JSON or other parsing error
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error: any) {
            // console.error("Download Error:", error);
            alert(`Failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const sizeStyles = {
        sm: "px-2.5 py-1",
        md: "px-3 py-1.5",
        lg: "px-4 py-2",
    };

    const baseStyles =
        "inline-flex items-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sys-brand";

    const variants = {
        primary: "bg-sys-brand text-sys-bg-white hover:bg-sys-brand",
        secondary: "bg-sys-bg-tertiary text-sys-primary hover:bg-sys-tertiary/20",
        outline:
            "border border-sys-tertiary text-text-primary bg-sys-bg-white hover:bg-sys-bg-tertiary",
        ghost: "text-sys-secondary hover:text-sys-primary hover:bg-sys-bg-tertiary",
    };

    // Icon sizes
    const iconSize =
        size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className} ${isLoading ? "opacity-70 cursor-wait" : ""
                }`}
        >
            {isLoading ? (
                <svg
                    className={`animate-spin -ml-1 mr-2 ${iconSize} text-current`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : (
                <Download className={iconSize} />
            )}
            {label}
        </button>
    );
}

