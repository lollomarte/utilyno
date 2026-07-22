"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playerName } from "@/lib/format";
import type { Player } from "@/lib/types";

interface PlayerSearchSelectProps {
  players: Player[];
  value: string;
  onChange: (playerId: string) => void;
  placeholder?: string;
  allLabel?: string;
}

export function PlayerSearchSelect({
  players,
  value,
  onChange,
  placeholder = "Cerca giocatore…",
  allLabel,
}: PlayerSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = players.find((p) => p.id === value) ?? null;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const options = useMemo(() => {
    const term = query.trim().toLowerCase();
    return players
      .filter((p) => !term || playerName(p).toLowerCase().includes(term))
      .sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome));
  }, [players, query]);

  function select(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="tap flex items-center gap-2 border border-line rounded-full px-3 py-1.5 text-sm bg-surface text-ink hover:border-line-strong min-w-[9rem] max-w-[12rem]"
      >
        <span className={`flex-1 text-left truncate ${selected ? "" : "text-muted"}`}>
          {selected ? playerName(selected) : (allLabel ?? placeholder)}
        </span>
        <span className="text-muted text-xs shrink-0">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 left-1/2 -translate-x-1/2 mt-1 w-56 max-w-[calc(100vw-2rem)] max-h-64 overflow-y-auto rounded-lg border border-line-strong bg-surface shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm bg-transparent border-b border-line outline-none sticky top-0 bg-surface"
          />
          {allLabel && (
            <button
              type="button"
              onClick={() => select("")}
              className="tap w-full text-left px-3 py-2 text-sm hover:bg-surface-2 text-muted"
            >
              {allLabel}
            </button>
          )}
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted">Nessun giocatore trovato</div>
          ) : (
            options.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => select(p.id)}
                className="tap w-full text-left px-3 py-2 text-sm hover:bg-surface-2"
              >
                {playerName(p)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
