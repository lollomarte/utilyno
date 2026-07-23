import { getTop8Formation } from "@/lib/data/market";
import { EmptyState } from "@/components/EmptyState";
import { FormationRow } from "@/components/FormationRow";

export default async function Top8Page() {
  const { attaccanti, centrocampisti, difensori } = await getTop8Formation();
  const hasAnyPlayer = attaccanti.length + centrocampisti.length + difensori.length > 0;

  if (!hasAnyPlayer) {
    return <EmptyState>Nessun giocatore con quotazione di mercato ancora.</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Top 8</h1>
        <p className="text-sm text-muted">
          La formazione dei fenomeni: i giocatori più quotati del mercato, per ruolo.
        </p>
      </div>

      <div className="relative rounded-3xl border border-line-strong bg-surface overflow-hidden p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-4 border border-ink rounded-2xl" />
          <div className="absolute left-1/2 top-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-ink -translate-x-1/2" />
        </div>

        <div className="relative flex flex-col gap-8 sm:gap-10">
          <FormationRow label="Attaccanti" players={attaccanti} slots={2} />
          <FormationRow label="Centrocampisti" players={centrocampisti} slots={3} />
          <FormationRow label="Difensori" players={difensori} slots={3} />
        </div>
      </div>
    </div>
  );
}
