import { api } from "@/lib/api";
import { SRVListClient } from "@/components/srv/SRVListClient";

async function getSRVsData() {
  try {
    const [srvData, statsData] = await Promise.all([api.listSRVs(), api.getSRVStats()]);
    return { srvs: srvData || [], stats: statsData };
  } catch {
    // console.error("Error fetching SRVs in RSC:", err);
    return { srvs: [], stats: null };
  }
}

export default async function SRVListPage() {
  const { srvs, stats } = await getSRVsData();

  return (
    <SRVListClient initialSRVs={srvs} initialStats={stats} />
  );
}
