import { getFormationComparisonData } from "@/lib/data/formationComparison";
import { FormationComparison } from "@/components/FormationComparison";
import { EmptyState } from "@/components/EmptyState";

const MIN_PLAYERS = 2;

export default async function ConfrontaFormazionePage() {
  const { allPlayers, playerStats } = await getFormationComparisonData();

  if (allPlayers.length < MIN_PLAYERS) {
    return (
      <EmptyState>
        Servono almeno {MIN_PLAYERS} giocatori registrati per confrontare due formazioni.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Confronta formazione</h1>
        <p className="text-sm text-muted">
          Scegli fino a 8 giocatori per i Bianchi e 8 per i Neri e confronta le due formazioni sulla carta.
        </p>
      </div>

      <FormationComparison allPlayers={allPlayers} playerStats={playerStats} />
    </div>
  );
}
