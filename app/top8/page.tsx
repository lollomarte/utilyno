import { getTop8Formation } from "@/lib/data/market";
import { EmptyState } from "@/components/EmptyState";
import { FormationRow } from "@/components/FormationRow";

export default async function Top8Page() {
  const { principale, serieB } = await getTop8Formation();
  const hasAnyPlayer =
    principale.attaccanti.length + principale.centrocampisti.length + principale.difensori.length > 0;

  if (!hasAnyPlayer) {
    return <EmptyState>Il mercato è ancora fermo: gioca qualche partita e la Top 8 prende forma ⚽</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Top 8</h1>
        <p className="text-sm text-muted">
          La formazione dei fenomeni: i giocatori più quotati del mercato, per ruolo.
        </p>
      </div>

      <Pitch>
        <FormationRow label="Attaccanti" players={principale.attaccanti} slots={2} />
        <FormationRow label="Centrocampisti" players={principale.centrocampisti} slots={3} />
        <FormationRow label="Difensori" players={principale.difensori} slots={3} />
      </Pitch>

      <div>
        <h2 className="font-display text-lg font-bold text-muted mb-1">Top 8 Serie B</h2>
        <p className="text-sm text-muted">I prossimi in lista per ruolo, subito fuori dalla formazione titolare.</p>
      </div>

      <Pitch muted>
        <FormationRow label="Attaccanti" players={serieB.attaccanti} slots={2} valueClassName="text-muted" />
        <FormationRow
          label="Centrocampisti"
          players={serieB.centrocampisti}
          slots={3}
          valueClassName="text-muted"
        />
        <FormationRow label="Difensori" players={serieB.difensori} slots={3} valueClassName="text-muted" />
      </Pitch>
    </div>
  );
}

function Pitch({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden p-5 sm:p-8 ${
        muted ? "border-line bg-surface/60" : "border-line-strong bg-surface"
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 ${muted ? "opacity-[0.05]" : "opacity-[0.08]"}`}>
        <div className="absolute inset-4 border border-ink rounded-2xl" />
        <div className="absolute left-1/2 top-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-ink -translate-x-1/2" />
      </div>

      <div className="relative flex flex-col gap-8 sm:gap-10">{children}</div>
    </div>
  );
}
