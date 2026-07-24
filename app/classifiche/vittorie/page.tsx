import { getWinsStandingWithDelta, getYearTaggedParticipants, getYearsList } from "@/lib/data/stats";
import { VictoriesTable } from "@/components/VictoriesTable";
import { EmptyState } from "@/components/EmptyState";

export default async function VittoriePage() {
  const [withDelta, yearRows, years] = await Promise.all([
    getWinsStandingWithDelta(),
    getYearTaggedParticipants(),
    getYearsList(),
  ]);
  const data = withDelta.filter((p) => p.presenze > 0);

  if (data.length === 0) {
    return <EmptyState>Nessuna vittoria in bacheca ancora: si parte 0-0 per tutti 🏆</EmptyState>;
  }

  return <VictoriesTable data={data} yearRows={yearRows} years={years} />;
}
