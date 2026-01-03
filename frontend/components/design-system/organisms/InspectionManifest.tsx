"use client";

import React from "react";
import { DataTable, type Column } from "./DataTable";
import { Flex, Stack } from "../atoms/Layout";
import { Title3 } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";

interface InspectionManifestProps {
    items: any[];
    columns: Column<any>[];
}

export const InspectionManifest = ({ items, columns }: InspectionManifestProps) => {
    return (
        <Stack gap={3}>
            <Flex align="center" gap={3} justify="between">
                <Title3 className="m-0 uppercase tracking-[0.2em]">
                    Inspection Manifest
                </Title3>
                <Badge variant="outline" className="opacity-60">
                    {items.length} Quality Nodes
                </Badge>
            </Flex>
            <div className="surface-card bg-app-border/30 overflow-hidden">
                <div className="bg-app-surface overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={items}
                        keyField="id"
                        density="compact"
                        className="w-full"
                    />
                </div>
            </div>
        </Stack>
    );
};
