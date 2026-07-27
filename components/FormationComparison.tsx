"use client";

import { useMemo, useState } from "react";
import { PlayerSlotSelect } from "@/components/admin/PlayerSlotSelect";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { ComparisonRow, type StatComparison } from "@/components/ComparisonRow";
import {
  aggregateTeam,
  type FormationPlayerStats,
  type FormationTeamAggregate,
} from "@/lib/formationComparison";
import { formatDecimal, formatMarketValue, playerName, ruoloLabel } from "@/lib/format";
import type { Player } from "@/lib/types";

const SLOT_COUNT = 8;

function emptySlots(): string[] {
  return Array.from({ length: SLOT_COUNT }, () => "");
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function buildShareText(bianchi: FormationTeamAggregate, neri: FormationTeamAggregate): string {
  const diff = round1(bianchi.valoreMercatoTotale - neri.valoreMercatoTotale);
  const favorite = diff === 0 ? null : diff > 0 ? "Bianchi" : "Neri";

  const teamLines = (team: FormationTeamAggregate, label: string) => [
    `${label} (${formatMarketValue(team.valoreMercatoTotale)}):`,
    ...(team.players.length > 0 ? team.players.map((p) => `- ${playerName(p.player)}`) : ["- (nessun giocatore)"]),
  ];

  return [
    "⚖️ Confronto formazione",
    "",
    ...teamLines(bianchi, "Bianchi"),
    "",
    ...teamLines(neri, "Neri"),
    "",
    `Valore mercato: ${formatMarketValue(bianchi.valoreMercatoTotale)} – ${formatMarketValue(neri.valoreMercatoTotale)}`,
    `Gol fatti: ${bianchi.golFattiTotale} – ${neri.golFattiTotale}`,
    `Gol subiti: ${bianchi.golSubitiTotale} – ${neri.golSubitiTotale}`,
    `Differenza reti: ${bianchi.differenzaReti} – ${neri.differenzaReti}`,
    `Media presenze: ${formatDecimal(bianchi.mediaPresenze, 1)} – ${formatDecimal(neri.mediaPresenze, 1)}`,
    `% vittorie media: ${formatDecimal(bianchi.mediaPercentualeVittorie, 1)}% – ${formatDecimal(neri.mediaPercentualeVittorie, 1)}%`,
    favorite ? `${favorite} favoriti sulla carta 🏆 (diff. ${formatMarketValue(Math.abs(diff))})` : "Equilibrio perfetto sulla carta 🤝",
  ].join("\n");
}

export function FormationComparison({
  allPlayers,
  playerStats,
}: {
  allPlayers: Player[];
  playerStats: FormationPlayerStats[];
}) {
  const { push } = useToast();
  const [biancaIds, setBiancaIds] = useState<string[]>(emptySlots);
  const [neraIds, setNeraIds] = useState<string[]>(emptySlots);

  const statsByPlayer = useMemo(() => new Map(playerStats.map((s) => [s.player.id, s])), [playerStats]);
  const bianchi = useMemo(() => aggregateTeam(biancaIds, statsByPlayer), [biancaIds, statsByPlayer]);
  const neri = useMemo(() => aggregateTeam(neraIds, statsByPlayer), [neraIds, statsByPlayer]);

  const chosenIds = useMemo(() => new Set([...biancaIds, ...neraIds].filter(Boolean)), [biancaIds, neraIds]);

  function excludeIdsFor(currentId: string) {
    const ids = new Set(chosenIds);
    if (currentId) ids.delete(currentId);
    return ids;
  }

  function updateSlot(squadra: "bianca" | "nera", index: number, playerId: string) {
    const setter = squadra === "bianca" ? setBiancaIds : setNeraIds;
    setter((ids) => ids.map((id, i) => (i === index ? playerId : id)));
  }

  const hasBothTeams = bianchi.count > 0 && neri.count > 0;
  const diffValore = round1(bianchi.valoreMercatoTotale - neri.valoreMercatoTotale);
  const favorite = diffValore === 0 ? null : diffValore > 0 ? "Bianchi" : "Neri";

  async function copyForWhatsApp() {
    const text = buildShareText(bianchi, neri);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // utente ha annullato la condivisione, nessuna azione necessaria
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      push("Confronto copiato negli appunti");
    } catch {
      push("Impossibile copiare il testo", "error");
    }
  }

  const sections: { title: string; stats: StatComparison[] }[] = [
    {
      title: "Gol",
      stats: [
        { label: "Gol fatti (storico)", valueA: bianchi.golFattiTotale, valueB: neri.golFattiTotale },
        {
          label: "Gol subiti (storico)",
          valueA: bianchi.golSubitiTotale,
          valueB: neri.golSubitiTotale,
          higherIsBetter: false,
        },
        { label: "Differenza reti", valueA: bianchi.differenzaReti, valueB: neri.differenzaReti },
      ],
    },
    {
      title: "Esperienza e rendimento",
      stats: [
        {
          label: "Media presenze",
          valueA: bianchi.mediaPresenze,
          valueB: neri.mediaPresenze,
          format: (v) => formatDecimal(v, 1),
        },
        {
          label: "% vittorie media",
          valueA: bianchi.mediaPercentualeVittorie,
          valueB: neri.mediaPercentualeVittorie,
          format: (v) => `${formatDecimal(v, 1)}%`,
        },
      ],
    },
    {
      title: "Composizione ruoli",
      stats: [
        {
          label: `${ruoloLabel.difensore}i`,
          valueA: bianchi.ruoli.difensore,
          valueB: neri.ruoli.difensore,
          neutral: true,
        },
        {
          label: `${ruoloLabel.centrocampista}i`,
          valueA: bianchi.ruoli.centrocampista,
          valueB: neri.ruoli.centrocampista,
          neutral: true,
        },
        {
          label: `${ruoloLabel.attaccante}i`,
          valueA: bianchi.ruoli.attaccante,
          valueB: neri.ruoli.attaccante,
          neutral: true,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TeamSlots
          label="SQUADRA BIANCA"
          headerClass="bg-bianca-dim border border-line-strong"
          rowClass="border-line-strong bg-bianca-dim"
          ids={biancaIds}
          players={allPlayers}
          onChange={(i, id) => updateSlot("bianca", i, id)}
          excludeIdsFor={excludeIdsFor}
        />
        <TeamSlots
          label="SQUADRA NERA"
          headerClass="bg-nera border border-nera-line"
          rowClass="border-nera-line bg-nera"
          ids={neraIds}
          players={allPlayers}
          onChange={(i, id) => updateSlot("nera", i, id)}
          excludeIdsFor={excludeIdsFor}
        />
      </div>

      {!hasBothTeams && (
        <p className="text-xs text-muted text-center">
          Seleziona almeno un giocatore per Bianchi e uno per Neri per vedere il confronto.
        </p>
      )}

      {hasBothTeams && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <TeamValueHeader label="Bianchi" valore={bianchi.valoreMercatoTotale} isBianca />
              <TeamValueHeader label="Neri" valore={neri.valoreMercatoTotale} isBianca={false} />
            </div>

            <VerdictBadge favorite={favorite} diff={diffValore} />

            <div className="flex flex-col mt-1">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted font-semibold pt-3 pb-1">Mercato</p>
                <ComparisonRow
                  stat={{
                    label: "Valore totale",
                    valueA: bianchi.valoreMercatoTotale,
                    valueB: neri.valoreMercatoTotale,
                    format: formatMarketValue,
                  }}
                />
              </div>
              {sections.map((section) => (
                <div key={section.title}>
                  <p className="text-xs uppercase tracking-widest text-muted font-semibold pt-3 pb-1">
                    {section.title}
                  </p>
                  {section.stats.map((stat) => (
                    <ComparisonRow key={stat.label} stat={stat} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <Button type="button" variant="secondary" onClick={copyForWhatsApp} className="w-full">
            Copia per WhatsApp
          </Button>
        </div>
      )}
    </div>
  );
}

function TeamSlots({
  label,
  headerClass,
  rowClass,
  ids,
  players,
  onChange,
  excludeIdsFor,
}: {
  label: string;
  headerClass: string;
  rowClass: string;
  ids: string[];
  players: Player[];
  onChange: (index: number, playerId: string) => void;
  excludeIdsFor: (currentId: string) => Set<string>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className={`font-display text-xs font-bold text-center py-1.5 rounded-md ${headerClass}`}>{label}</h2>
      {ids.map((id, i) => (
        <div key={i} className={`rounded-md border p-2.5 flex items-center gap-2 ${rowClass}`}>
          <PlayerSlotSelect
            players={players}
            value={id}
            onChange={(playerId) => onChange(i, playerId)}
            excludeIds={excludeIdsFor(id)}
          />
        </div>
      ))}
    </div>
  );
}

function TeamValueHeader({ label, valore, isBianca }: { label: string; valore: number; isBianca: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${isBianca ? "" : "flex-row-reverse text-right"}`}>
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${isBianca ? "bg-bianca border border-line-strong" : "bg-nera"}`}
      />
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="font-display text-lg font-bold tabular-nums">{formatMarketValue(valore)}</p>
      </div>
    </div>
  );
}

function VerdictBadge({ favorite, diff }: { favorite: "Bianchi" | "Neri" | null; diff: number }) {
  return (
    <div className="flex justify-center mb-2">
      {favorite ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent text-xs font-semibold px-3 py-1">
          🏆 {favorite} favoriti · {formatMarketValue(Math.abs(diff))}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 text-muted text-xs font-semibold px-3 py-1">
          🤝 Equilibrio perfetto
        </span>
      )}
    </div>
  );
}
