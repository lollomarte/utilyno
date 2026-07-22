import { getAllMatchResultsWithParticipants } from "@/lib/data/matches";
import { getAllPlayers } from "@/lib/data/players";
import { EmptyState } from "@/components/EmptyState";
import { RisultatiList } from "@/components/RisultatiList";

export default async function RisultatiPage() {
  const [matches, players] = await Promise.all([getAllMatchResultsWithParticipants(), getAllPlayers()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Risultati</h1>
      {matches.length === 0 ? (
        <EmptyState>Nessuna partita registrata ancora.</EmptyState>
      ) : (
        <RisultatiList matches={matches} players={players} />
      )}
    </div>
  );
}
