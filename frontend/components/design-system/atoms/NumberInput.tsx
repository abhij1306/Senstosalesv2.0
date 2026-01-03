
import React from "react";
import { cn } from "@/lib/utils";

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <input
                type="number"
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    "appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none", // Hide spinners
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
NumberInput.displayName = "NumberInput";
