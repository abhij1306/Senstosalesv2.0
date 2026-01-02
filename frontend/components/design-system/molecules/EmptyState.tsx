import { ReactNode } from "react";
import { Card } from "../atoms/Card";
import { H3, Body } from "../atoms/Typography";
import { Flex } from "../atoms/Layout";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";


interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) => {
    return (
        <Card className={cn("text-center py-20 border-dashed border-app-border bg-app-surface/30 backdrop-blur-sm col-span-full", className)}>
            <Flex justify="center" className="mb-6">
                <div className="w-16 h-16 bg-app-accent/5 rounded-full flex items-center justify-center border border-app-accent/10">
                    <Icon className="w-8 h-8 text-app-accent/40" />
                </div>
            </Flex>
            <H3 className="mb-2 text-app-fg">{title}</H3>
            <Body className="text-app-fg-muted mb-6 max-w-md mx-auto">
                {description}
            </Body>
            {action && <Flex justify="center">{action}</Flex>}
        </Card>
    );
};
