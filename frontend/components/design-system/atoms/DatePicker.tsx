import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface DatePickerProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    type="date"
                    className={cn(
                        "flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        "glass-input text-app-fg appearance-none",
                        error && "border-system-red focus-visible:ring-system-red",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {/* Helper icon can be added here if needed, but native picker usually suffices */}
            </div>
        );
    }
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
