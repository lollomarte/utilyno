import { notFound } from "next/navigation";
import { getAllPlayers } from "@/lib/data/players";
import { getMatchFull } from "@/lib/data/matches";
import { updateMatchAction } from "@/lib/actions/matches";
import { MatchForm } from "@/components/admin/MatchForm";

export default async function ModificaPartitaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [players, full] = await Promise.all([getAllPlayers(), getMatchFull(id)]);
  if (!full) notFound();

  const initialRows = full.participants.map((p) => ({
    key: p.id,
    player_id: p.player.id,
    squadra: p.squadra,
    gol: p.gol,
  }));

  return (
    <div>
      <h1 className="font-display text-xl font-bold mb-4">Modifica partita</h1>
      <MatchForm
        players={players}
        action={updateMatchAction}
        matchId={full.match.id}
        initialData={full.match.data}
        initialNote={full.match.note ?? ""}
        initialMvp={full.mvp?.id ?? ""}
        initialRows={initialRows}
        initialRisultatoManuale={full.match.risultato_modificato_manualmente}
        initialGolBiancaFinale={full.match.gol_bianca_finale}
        initialGolNeraFinale={full.match.gol_nera_finale}
        submitLabel="Salva modifiche"
      />
    </div>
  );
}
