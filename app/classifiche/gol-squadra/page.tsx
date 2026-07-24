import { getTeamGoalsStanding } from "@/lib/data/stats";
import { TeamGoalsTable } from "@/components/TeamGoalsTable";
import { EmptyState } from "@/components/EmptyState";

export default async function GolSquadraPage() {
  const data = (await getTeamGoalsStanding()).filter((p) => p.presenze > 0);

  if (data.length === 0) {
    return <EmptyState>Nessuna statistica disponibile ancora.</EmptyState>;
  }

  return <TeamGoalsTable data={data} />;
}
