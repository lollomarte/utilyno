import { getAllPlayers } from "@/lib/data/players";
import { createMatchAction } from "@/lib/actions/matches";
import { MatchForm } from "@/components/admin/MatchForm";
import { nearestMonday } from "@/lib/season";

export default async function NuovaPartitaPage() {
  const players = await getAllPlayers();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Nuova partita</h1>
      <MatchForm players={players} action={createMatchAction} initialData={nearestMonday()} />
    </div>
  );
}
