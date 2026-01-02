"use client";

import React from "react";
import { SummaryCards } from "@/components/design-system/organisms/SummaryCards";
import { Flex, Stack } from "@/components/design-system/atoms/Layout";
import { Badge } from "@/components/design-system/atoms/Badge";
import { H3, Body, SmallText } from "@/components/design-system/atoms/Typography";
import { useRouter } from "next/navigation";
import { Package, Calendar, User } from "lucide-react";

interface SRVDetailCardProps {
    header: any;
    summary: any;
}

export const SRVDetailCard = ({ header, summary }: SRVDetailCardProps) => {
    const router = useRouter();

    return (
        <Stack gap={6}>
            <SummaryCards cards={summary} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-app-surface border border-app-border rounded-xl shadow-sm p-6 border-l-4 border-l-app-accent">
                    <Stack gap={3}>
                        <Flex align="center" gap={2}>
                            <Package size={16} className="text-app-accent" />
                            <H3 className="m-0 text-app-accent font-semibold">Source PO</H3>
                        </Flex>
                        <Flex direction="col" gap={1}>
                            <Badge
                                variant="accent"
                                className="w-fit cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                                onClick={() => router.push(`/po/${header.po_number}`)}
                            >
                                PO #{header.po_number}
                            </Badge>
                            <SmallText className="text-app-fg-muted">
                                Source identifying document for this SRV
                            </SmallText>
                        </Flex>
                    </Stack>
                </div>
            </div>
        </Stack>
    );
};
