import { ReactNode } from "react";
import { Card } from "../atoms/Card";
import { H3, Body } from "../atoms/Typography";
import { Flex } from "../atoms/Layout";
import { LucideIcon } from "lucide-react";

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
        <Card className={`text-center py-24 border-dashed border-[#E5E7EB] col-span-full ${className}`}>
            <Flex justify="center" className="mb-4">
                <div className="w-16 h-16 bg-[#F9FAFB] rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-[#D1D5DB]" />
                </div>
            </Flex>
            <H3 className="mb-2">{title}</H3>
            <Body className="text-[#6B7280] mb-6 max-w-md mx-auto">
                {description}
            </Body>
            {action && <Flex justify="center">{action}</Flex>}
        </Card>
    );
};
