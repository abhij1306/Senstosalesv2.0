import { api } from "@/lib/api";
import { POListClient } from "./POListClient";

async function getPOsData() {
    try {
        const [posData, statsData] = await Promise.all([
            api.listPOs(),
            api.getPOStats(),
        ]);
        return {
            pos: posData || [],
            stats: statsData,
        };
    } catch (error) {
        console.error("Error fetching POs in Server Component:", error);
        return {
            pos: [],
            stats: {
                total_pos: 0,
                active_count: 0,
                total_value: 0,
                pending_pos: 0,
                completed_pos: 0,
                total_value_ytd: 0,
                open_orders_count: 0,
                pending_approval_count: 0,
                total_value_change: 0,
            },
        };
    }
}

export default async function POListPage() {
    const { pos, stats } = await getPOsData();

    return (
        <POListClient initialPOs={pos} initialStats={stats} />
    );
}
