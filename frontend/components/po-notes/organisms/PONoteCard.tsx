import {
    Edit2,
    Trash2,
    FileText,
    CheckSquare,
} from "lucide-react";
import { PONote } from "@/lib/api";
import { Card } from "@/components/design-system/atoms/Card";
import { Button } from "@/components/design-system/atoms/Button";
import { Badge } from "@/components/design-system/atoms/Badge";
import { H3, SmallText } from "@/components/design-system/atoms/Typography";
import { Flex, Box } from "@/components/design-system/atoms/Layout";

interface PONoteCardProps {
    template: PONote;
    onEdit: (template: PONote) => void;
    onDelete: (id: number) => void;
}

export const PONoteCard = ({ template, onEdit, onDelete }: PONoteCardProps) => {
    return (
        <Card
            className="surface-claymorphic shadow-clay-surface h-full hover:shadow-lg transition-all animate-in fade-in zoom-in-95 duration-300 border border-[var(--color-sys-surface-glass_border_light)]"
        >
            <div className="p-6 flex-1 flex flex-col">
                <Flex justify="between" align="start" className="mb-4">
                    <Flex align="center" gap={3} className="flex-1">
                        <div className="w-10 h-10 bg-[var(--color-sys-brand-primary)]/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-[var(--color-sys-brand-primary)]" />
                        </div>
                        <H3 className="text-[16px] line-clamp-1 text-[var(--color-sys-text-primary)]">
                            {template.title}
                        </H3>
                    </Flex>
                    <Flex gap={1}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(template)}
                            title="Edit"
                        >
                            <Edit2 size={14} className="text-[var(--color-sys-text-secondary)]" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(template.id)}
                            className="text-[var(--color-sys-status-error)] hover:text-[var(--color-sys-status-error)]/80"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </Flex>
                </Flex>
                <Box className="flex-1 bg-[var(--color-sys-bg-tertiary)]/30 rounded-lg p-4 border border-[var(--color-sys-text-tertiary)]/10">
                    <SmallText className="text-[var(--color-sys-text-secondary)] leading-relaxed whitespace-pre-wrap line-clamp-6">
                        {template.content}
                    </SmallText>
                </Box>
                <Flex
                    align="center"
                    justify="between"
                    className="mt-4 pt-4 border-t border-[var(--color-sys-text-tertiary)]/10"
                >
                    <SmallText className="text-[var(--color-sys-text-tertiary)]">
                        Ver. {new Date(template.updated_at).getFullYear()}.
                        {new Date(template.updated_at).getMonth() + 1}
                    </SmallText>
                    <Badge variant="success">
                        <CheckSquare size={12} /> Active
                    </Badge>
                </Flex>
            </div>
        </Card>
    );
};
