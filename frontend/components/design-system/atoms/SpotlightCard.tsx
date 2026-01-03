"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardProps } from "./Card";

interface SpotlightCardProps extends CardProps {
    children: React.ReactNode;
    active?: boolean;
}

const SpotlightCardInternal = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
    ({ children, className, active = false, variant = "elevated", ...props }, ref) => {
        const divRef = useRef<HTMLDivElement>(null);
        const [position, setPosition] = useState({ x: 0, y: 0 });
        const [opacity, setOpacity] = useState(0);

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!divRef.current) return;
            const rect = divRef.current.getBoundingClientRect();
            setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            setOpacity(1);
        };

        const handleMouseLeave = () => {
            setOpacity(0);
        };

        return (
            <div
                ref={divRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative group rounded-2xl"
            >
                <div
                    className={cn(
                        "absolute -inset-px rounded-[17px] opacity-0 transition duration-300 group-hover:opacity-100",
                        active && "opacity-100"
                    )}
                    style={{
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(var(--color-accent), 0.15), transparent 40%)`,
                    }}
                />
                <Card
                    ref={ref}
                    variant={variant}
                    className={cn(
                        "relative z-10 h-full transition-all duration-300",
                        active && "border-app-accent/20 ring-1 ring-app-accent/20",
                        className
                    )}
                    {...props}
                >
                    {children}
                </Card>
            </div>
        );
    }
);

SpotlightCardInternal.displayName = "SpotlightCard";

export const SpotlightCard = React.memo(SpotlightCardInternal);
