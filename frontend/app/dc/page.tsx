import { api } from "@/lib/api";
import { DCListClient } from "./DCListClient";

async function getDCsData() {
  try {
    const [dcsData, statsData] = await Promise.all([api.listDCs(), api.getDCStats()]);
    return { dcs: dcsData || [], stats: statsData };
  } catch {
    // console.error("Error fetching DCs in RSC:", err);
    return { dcs: [], stats: null };
  }
}

export default async function DCListPage() {
  const { dcs, stats } = await getDCsData();

  return (
    <DCListClient initialDCs={dcs} initialStats={stats} />
  );
}
