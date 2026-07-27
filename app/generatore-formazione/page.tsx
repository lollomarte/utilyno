import { getFormationGeneratorPool } from "@/lib/data/market";
import { FormationGenerator } from "@/components/FormationGenerator";
import { EmptyState } from "@/components/EmptyState";

const TEAM_SIZE = 16;

export default async function GeneratoreFormazionePage() {
  const pool = await getFormationGeneratorPool();

  if (pool.length < TEAM_SIZE) {
    return (
      <EmptyState>
        Servono almeno {TEAM_SIZE} giocatori attivi per generare due squadre da 8: al momento ce ne sono{" "}
        {pool.length} 🎮
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Generatore formazione</h1>
        <p className="text-sm text-muted">
          Scegli 16 giocatori: li dividiamo in due squadre da 8 bilanciando il valore di mercato totale.
        </p>
      </div>

      <FormationGenerator pool={pool} />
    </div>
  );
}
