import { getScorersStandingWithDelta, getYearTaggedParticipants, getYearsList } from "@/lib/data/stats";
import { ScorersTable } from "@/components/ScorersTable";
import { EmptyState } from "@/components/EmptyState";

export default async function MarcatoriPage() {
  const [withDelta, yearRows, years] = await Promise.all([
    getScorersStandingWithDelta(),
    getYearTaggedParticipants(),
    getYearsList(),
  ]);
  const data = withDelta.filter((p) => p.presenze > 0);

  if (data.length === 0) {
    return <EmptyState>Nessuna statistica disponibile ancora.</EmptyState>;
  }

  return <ScorersTable data={data} yearRows={yearRows} years={years} />;
}
