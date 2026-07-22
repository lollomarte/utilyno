"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { StaggerList, StaggerItem } from "@/components/StaggerList";
import { MatchCard } from "@/components/MatchCard";
import { PlayerSearchSelect } from "@/components/PlayerSearchSelect";
import type { MatchResultWithParticipants } from "@/lib/data/matches";
import type { Player } from "@/lib/types";

type WinnerFilter = "" | "bianca" | "nera" | "pareggio";

const winnerFilters: { value: WinnerFilter; label: string }[] = [
  { value: "", label: "Tutte" },
  { value: "bianca", label: "Vittorie Bianchi" },
  { value: "nera", label: "Vittorie Neri" },
  { value: "pareggio", label: "Pareggi" },
];

function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function RisultatiList({
  matches,
  players,
}: {
  matches: MatchResultWithParticipants[];
  players: Player[];
}) {
  const [winner, setWinner] = useState<WinnerFilter>("");
  const [playerId, setPlayerId] = useState("");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (winner) {
        const actual: WinnerFilter =
          m.gol_bianca === m.gol_nera ? "pareggio" : m.gol_bianca > m.gol_nera ? "bianca" : "nera";
        if (actual !== winner) return false;
      }
      if (playerId && !m.participants.some((p) => p.player_id === playerId)) return false;
      return true;
    });
  }, [matches, winner, playerId]);

  const groups = useMemo(() => {
    const acc: { label: string; matches: MatchResultWithParticipants[] }[] = [];
    for (const m of filtered) {
      const label = monthLabel(m.data);
      const last = acc[acc.length - 1];
      if (last && last.label === label) last.matches.push(m);
      else acc.push({ label, matches: [m] });
    }
    return acc;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {winnerFilters.map((f) => (
          <button
            key={f.value || "tutte"}
            type="button"
            onClick={() => setWinner(f.value)}
            className={`tap px-3 py-1.5 text-sm rounded-full border transition-colors ${
              winner === f.value
                ? "bg-accent text-[#06210f] border-accent"
                : "border-line text-muted hover:text-ink hover:border-line-strong"
            }`}
          >
            {f.label}
          </button>
        ))}
        <PlayerSearchSelect
          players={players}
          value={playerId}
          onChange={setPlayerId}
          allLabel="Tutti i giocatori"
          placeholder="Cerca giocatore…"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState>Nessuna partita corrisponde ai filtri selezionati.</EmptyState>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2 capitalize">
                {group.label}
              </p>
              <StaggerList className="flex flex-col gap-2 relative border-l border-line ml-2 pl-4">
                {group.matches.map((m) => (
                  <StaggerItem key={m.match_id}>
                    <MatchCard match={m} />
                  </StaggerItem>
                ))}
              </StaggerList>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
