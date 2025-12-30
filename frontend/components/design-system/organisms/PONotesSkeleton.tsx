import { Card } from "../atoms/Card";
import { Flex, Grid } from "../atoms/Layout";

export const PONotesSkeleton = () => {
    return (
        <Grid cols="1" className="md:grid-cols-2 lg:grid-cols-3" gap={6}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="surface-claymorphic shadow-clay-surface h-full min-h-[220px] transition-all border border-[var(--color-sys-surface-glass_border_light)]">
                    <div className="p-6 h-full flex flex-col gap-4">
                        <Flex align="center" gap={3}>
                            <div className="w-10 h-10 rounded-lg bg-sys-bg-tertiary animate-pulse" />
                            <div className="h-5 w-32 bg-sys-bg-tertiary rounded animate-pulse" />
                        </Flex>
                        <div className="flex-1 bg-sys-bg-tertiary/20 rounded-lg border border-sys-bg-tertiary/10 animate-pulse min-h-[100px]" />
                        <div className="pt-4 border-t border-[var(--color-sys-text-tertiary)]/10">
                            <div className="h-3 w-20 bg-sys-bg-tertiary rounded animate-pulse" />
                        </div>
                    </div>
                </Card>
            ))}
        </Grid>
    );
};
