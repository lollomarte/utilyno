"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { playerName } from "@/lib/format";
import type { Player } from "@/lib/types";

interface PlayerMultiSelectProps {
  players: Player[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max: number;
}

export function PlayerMultiSelect({ players, selectedIds, onChange, max }: PlayerMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = selectedIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const full = selectedIds.length >= max;

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
      .filter((p) => !selectedIds.includes(p.id))
      .filter((p) => !term || playerName(p).toLowerCase().includes(term))
      .sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome));
  }, [players, selectedIds, query]);

  function add(id: string) {
    if (full) return;
    onChange([...selectedIds, id]);
    setQuery("");
    if (selectedIds.length + 1 >= max) setOpen(false);
  }

  function remove(id: string) {
    onChange(selectedIds.filter((existing) => existing !== id));
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Giocatori</span>
        <span className={`text-xs font-medium tabular-nums ${full ? "text-accent" : "text-muted"}`}>
          {selectedIds.length} / {max} selezionati
        </span>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => remove(p.id)}
              className="tap flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-line-strong bg-surface-2 text-xs font-medium hover:border-loss/50 hover:bg-loss/10 transition-colors"
            >
              <PlayerAvatar player={p} size={20} />
              {playerName(p)}
              <span className="text-muted">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          disabled={full}
          placeholder={full ? "Limite raggiunto" : "Cerca giocatore da aggiungere…"}
          className="w-full border border-line bg-surface rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-50"
        />
        {open && !full && (
          <div className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-md border border-line-strong bg-surface-2 shadow-float">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted">Nessun giocatore trovato</div>
            ) : (
              options.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => add(p.id)}
                  className="tap w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-surface-3"
                >
                  <PlayerAvatar player={p} size={24} />
                  {playerName(p)}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
