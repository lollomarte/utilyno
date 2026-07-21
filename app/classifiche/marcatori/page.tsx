import { getScorersStanding } from "@/lib/data/stats";
import { ScorersTable } from "@/components/ScorersTable";
import { EmptyState } from "@/components/EmptyState";

export default async function MarcatoriPage() {
  const data = (await getScorersStanding()).filter((p) => p.presenze > 0);

  if (data.length === 0) {
    return <EmptyState>Nessuna statistica disponibile ancora.</EmptyState>;
  }

  return <ScorersTable data={data} />;
}
