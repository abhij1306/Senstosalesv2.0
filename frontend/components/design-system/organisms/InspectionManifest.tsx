"use client";

import React from "react";
import { DataTable, type Column } from "./DataTable";
import { Flex, Stack } from "../atoms/Layout";
import { H3 } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";

interface InspectionManifestProps {
    items: any[];
    columns: Column<any>[];
}

export const InspectionManifest = ({ items, columns }: InspectionManifestProps) => {
    return (
        <Stack gap={3}>
            <Flex align="center" gap={3} justify="between">
                <H3 className="m-0 uppercase tracking-[0.2em]">
                    Inspection Manifest
                </H3>
                <Badge variant="outline" className="opacity-60">
                    {items.length} Quality Nodes
                </Badge>
            </Flex>
            <div className="surface-card bg-app-border/30">
                <div className="bg-app-surface">
                    <DataTable
                        columns={columns}
                        data={items}
                        keyField="id"
                        density="compact"
                    />
                </div>
            </div>
        </Stack>
    );
};
