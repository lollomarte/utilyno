"use client";

import { useState } from "react";
import { PlayerMultiSelect } from "@/components/PlayerMultiSelect";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { generateBalancedTeams, type FormationResult, type FormationTeam } from "@/lib/formation";
import { playerName, formatMarketValue } from "@/lib/format";
import type { MarketValue } from "@/lib/data/market";

const TEAM_SIZE = 16;

function buildShareText(result: FormationResult): string {
  const teamLines = (team: FormationTeam, label: string) => [
    `${label} (${formatMarketValue(team.totale)}):`,
    ...team.players.map((p) => `- ${playerName(p.player)}`),
  ];

  return [
    "⚽ Formazione bilanciata",
    "",
    ...teamLines(result.bianchi, "Bianchi"),
    "",
    ...teamLines(result.neri, "Neri"),
    "",
    `Differenza: ${formatMarketValue(result.differenza)}`,
  ].join("\n");
}

export function FormationGenerator({ pool }: { pool: MarketValue[] }) {
  const { push } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<FormationResult | null>(null);

  const players = pool.map((mv) => mv.player);
  const missing = TEAM_SIZE - selectedIds.length;

  function generate() {
    const selected = selectedIds
      .map((id) => pool.find((mv) => mv.player.id === id))
      .filter((mv): mv is MarketValue => Boolean(mv));
    setResult(generateBalancedTeams(selected));
  }

  async function copyForWhatsApp() {
    if (!result) return;
    const text = buildShareText(result);

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
      push("Formazione copiata negli appunti");
    } catch {
      push("Impossibile copiare il testo", "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-line-strong bg-surface p-5 flex flex-col gap-4">
        <PlayerMultiSelect players={players} selectedIds={selectedIds} onChange={setSelectedIds} max={TEAM_SIZE} />

        {missing > 0 ? (
          <p className="text-xs text-muted">
            {missing === TEAM_SIZE
              ? `Seleziona ${TEAM_SIZE} giocatori per generare la formazione.`
              : `Mancano ancora ${missing} giocatori.`}
          </p>
        ) : (
          <Button type="button" onClick={generate} className="w-full">
            Genera formazione
          </Button>
        )}
      </div>

      {result && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TeamColumn team={result.bianchi} label="Bianchi" />
            <TeamColumn team={result.neri} label="Neri" />
          </div>

          <div className="rounded-2xl border border-line-strong bg-surface p-4 text-center">
            <p className="text-sm">
              <span className="font-display font-bold">{formatMarketValue(result.bianchi.totale)}</span>{" "}
              <span className="text-muted">Bianchi —</span>{" "}
              <span className="font-display font-bold">{formatMarketValue(result.neri.totale)}</span>{" "}
              <span className="text-muted">Neri — differenza</span>{" "}
              <span className="font-display font-bold text-accent">{formatMarketValue(result.differenza)}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="secondary" onClick={generate}>
              ↻ Rigenera
            </Button>
            <Button type="button" variant="secondary" onClick={copyForWhatsApp}>
              Copia per WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamColumn({ team, label }: { team: FormationTeam; label: string }) {
  const isBianca = team.squadra === "bianca";
  return (
    <div className="flex flex-col gap-2">
      <h2
        className={`font-display text-xs font-bold text-center py-1.5 rounded-md border ${
          isBianca ? "bg-bianca-dim border-line-strong" : "bg-nera border-nera-line"
        }`}
      >
        {label.toUpperCase()} · {formatMarketValue(team.totale)}
      </h2>
      <div className="flex flex-col gap-1.5">
        {team.players.map((mv) => (
          <div
            key={mv.player.id}
            className={`flex items-center gap-2.5 rounded-md border px-2.5 py-2 ${
              isBianca ? "border-line-strong bg-bianca-dim" : "border-nera-line bg-nera"
            }`}
          >
            <PlayerAvatar player={mv.player} size={28} />
            <span className="flex-1 text-sm font-medium truncate">{playerName(mv.player)}</span>
            <span className="text-xs font-display font-bold tabular-nums text-muted">
              {formatMarketValue(mv.valore)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
