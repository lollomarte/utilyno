"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playerName } from "@/lib/format";
import type { Player } from "@/lib/types";

interface PlayerSlotSelectProps {
  players: Player[];
  value: string;
  onChange: (playerId: string) => void;
  excludeIds: Set<string>;
  placeholder?: string;
}

export function PlayerSlotSelect({
  players,
  value,
  onChange,
  excludeIds,
  placeholder = "Slot vuoto…",
}: PlayerSlotSelectProps) {
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
      .filter((p) => p.attivo && !excludeIds.has(p.id))
      .filter((p) => !term || playerName(p).toLowerCase().includes(term))
      .sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome));
  }, [players, excludeIds, query]);

  function selectPlayer(p: Player) {
    onChange(p.id);
    setOpen(false);
    setQuery("");
  }

  function clearSelection(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0">
      <input
        type="text"
        value={open ? query : selected ? playerName(selected) : ""}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
            e.currentTarget.blur();
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (options.length > 0) selectPlayer(options[0]);
          }
        }}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm min-w-0 outline-none pr-5"
      />
      {selected && !open && (
        <button
          type="button"
          onClick={clearSelection}
          className="tap absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-sm leading-none"
          aria-label="Svuota slot"
        >
          ×
        </button>
      )}
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border border-line-strong bg-surface shadow-lg">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted">Nessun giocatore trovato</div>
          ) : (
            options.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPlayer(p)}
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
