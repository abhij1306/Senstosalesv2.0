import { api } from "@/lib/api";
import { DashboardShell } from "./DashboardShell";

// Force dynamic rendering for the dashboard to get fresh data
export const dynamic = 'force-dynamic';

async function getDashboardData() {
    try {
        const [summary, activity] = await Promise.all([
            api.getDashboardSummary(),
            api.getRecentActivity(20),
        ]);
        return { summary, activity };
    } catch {
        return { summary: null, activity: [] };
    }
}

export default async function DashboardPage() {
    // Parallel data fetching on the server
    const { summary, activity } = await getDashboardData();

    return (
        <DashboardShell
            summary={summary}
            activity={activity}
        />
    );
}
