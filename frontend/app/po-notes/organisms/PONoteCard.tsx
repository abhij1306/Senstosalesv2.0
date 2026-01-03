"use client";

import React from "react";
import {
    Edit2,
    Trash2,
    FileText,
    CheckSquare,
    Clock,
    Hash
} from "lucide-react";
import { PONote } from "@/lib/api";
import { Card, Button, Badge, Title3, SmallText, Flex, Stack, Box } from "@/components/design-system";
import { cn } from "@/lib/utils";

interface PONoteCardProps {
    template: PONote;
    onEdit: (template: PONote) => void;
    onDelete: (template: PONote) => void;
}

export const PONoteCard = ({ template, onEdit, onDelete }: PONoteCardProps) => {
    return (
        <Card
            className="group relative flex flex-col h-full bg-app-surface/50 border-none elevation-2 hover:elevation-3 transition-all duration-500 overflow-hidden"
        >
            {/* Background Decorative Element */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-app-accent/5 rounded-full blur-3xl group-hover:bg-app-accent/10 transition-colors" />

            <div className="p-5 flex-1 flex flex-col relative z-10">
                <Flex justify="between" align="start" className="mb-5">
                    <Flex align="center" gap={3} className="flex-1">
                        <div className="w-10 h-10 bg-app-overlay/10 rounded-2xl flex items-center justify-center shrink-0 border-none group-hover:bg-app-accent/10 transition-all duration-300 elevation-1">
                            <FileText className="w-5 h-5 text-app-fg-muted group-hover:text-app-accent transition-colors" />
                        </div>
                        <Stack gap={1}>
                            <Title3 className="text-sm font-black tracking-tight text-app-fg line-clamp-1 group-hover:text-app-accent transition-colors">
                                {template.title}
                            </Title3>
                            <Flex align="center" gap={1.5}>
                                <Hash className="w-2.5 h-2.5 text-app-fg-muted" />
                                <span className="text-[10px] font-bold text-app-fg-muted uppercase tracking-widest opacity-50">
                                    TERM-{template.id.toString().padStart(4, '0')}
                                </span>
                            </Flex>
                        </Stack>
                    </Flex>
                    <Flex gap={1} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(template)}
                            className="w-8 h-8 rounded-lg hover:bg-app-overlay/10"
                            title="Edit Provision"
                        >
                            <Edit2 size={12} className="text-app-fg-muted hover:text-app-accent transition-colors" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(template)}
                            className="w-8 h-8 rounded-lg hover:bg-app-status-error/10 text-app-fg-muted hover:text-app-status-error transition-colors"
                            title="Purge Clause"
                        >
                            <Trash2 size={12} />
                        </Button>
                    </Flex>
                </Flex>

                <Box className="flex-1 bg-app-overlay/5 rounded-xl p-4 border-none group-hover:bg-app-overlay/10 transition-all">
                    <p className="text-[12px] text-app-fg-muted font-medium leading-relaxed whitespace-pre-wrap line-clamp-5 group-hover:text-app-fg transition-colors">
                        {template.content}
                    </p>
                </Box>

                <Flex
                    align="center"
                    justify="between"
                    className="mt-5 pt-4 border-t border-app-border/20"
                >
                    <Flex align="center" gap={2}>
                        <Clock className="w-3 h-3 text-app-fg-muted opacity-40" />
                        <span className="text-[9px] font-black text-app-fg-muted uppercase tracking-[0.2em] opacity-40">
                            v.{new Date(template.updated_at).getFullYear()}.{new Date(template.updated_at).getMonth() + 1}
                        </span>
                    </Flex>
                    <Badge variant="success" className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-none bg-app-status-success/5">
                        Operational
                    </Badge>
                </Flex>
            </div>
        </Card>
    );
};
