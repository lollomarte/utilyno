import { getWinsStandingWithDelta } from "@/lib/data/stats";
import { VictoriesTable } from "@/components/VictoriesTable";
import { EmptyState } from "@/components/EmptyState";

export default async function VittoriePage() {
  const data = (await getWinsStandingWithDelta()).filter((p) => p.presenze > 0);

  if (data.length === 0) {
    return <EmptyState>Nessuna statistica disponibile ancora.</EmptyState>;
  }

  return <VictoriesTable data={data} />;
}
