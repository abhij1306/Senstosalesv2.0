"use client";

import { Card } from "@/components/design-system/atoms/Card";
import { Flex, Grid, Box, Stack } from "@/components/design-system/atoms/Layout";

export const PONotesSkeleton = () => {
    return (
        <Grid cols={1} className="sm:grid-cols-2 xl:grid-cols-3" gap={4}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-full min-h-[220px] bg-app-surface/50 border border-app-border/20 animate-pulse">
                    <div className="p-5 h-full flex flex-col gap-5">
                        <Flex align="center" gap={3}>
                            <div className="w-10 h-10 rounded-2xl bg-app-overlay/10 border border-app-border/10" />
                            <Stack gap={1} className="flex-1">
                                <div className="h-4 w-3/4 bg-app-overlay/10 rounded-lg" />
                                <div className="h-2 w-1/2 bg-app-overlay/5 rounded-lg opacity-50" />
                            </Stack>
                        </Flex>
                        <Box className="flex-1 bg-app-overlay/5 rounded-xl border border-app-border/5" />
                        <Flex align="center" justify="between" className="pt-4 border-t border-app-border/10">
                            <div className="h-3 w-16 bg-app-overlay/10 rounded-lg" />
                            <div className="h-5 w-20 bg-app-overlay/10 rounded-lg" />
                        </Flex>
                    </div>
                </Card>
            ))}
        </Grid>
    );
};
