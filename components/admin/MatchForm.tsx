"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Player, Squadra } from "@/lib/types";

interface Row {
  key: string;
  player_id: string;
  squadra: Squadra;
  gol: number;
}

type FormActionResult = { error?: string } | undefined;

interface MatchFormProps {
  players: Player[];
  action: (prevState: FormActionResult, formData: FormData) => Promise<FormActionResult>;
  matchId?: string;
  initialData?: string;
  initialNote?: string;
  initialMvp?: string | null;
  initialRows?: Row[];
  submitLabel?: string;
}

export function MatchForm({
  players,
  action,
  matchId,
  initialData,
  initialNote,
  initialMvp,
  initialRows,
  submitLabel = "Salva partita",
}: MatchFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [data, setData] = useState(initialData ?? "");
  const [note, setNote] = useState(initialNote ?? "");
  const [mvp, setMvp] = useState(initialMvp ?? "");
  const [rows, setRows] = useState<Row[]>(
    initialRows && initialRows.length > 0
      ? initialRows
      : [{ key: crypto.randomUUID(), player_id: "", squadra: "bianca", gol: 0 }]
  );

  function addRow() {
    setRows((r) => [...r, { key: crypto.randomUUID(), player_id: "", squadra: "bianca", gol: 0 }]);
  }

  function removeRow(key: string) {
    setRows((r) => r.filter((row) => row.key !== key));
  }

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  const golBianca = rows
    .filter((r) => r.squadra === "bianca")
    .reduce((s, r) => s + (Number(r.gol) || 0), 0);
  const golNera = rows
    .filter((r) => r.squadra === "nera")
    .reduce((s, r) => s + (Number(r.gol) || 0), 0);

  const validRows = rows.filter((r) => r.player_id);
  const chosenIds = new Set(validRows.map((r) => r.player_id));
  const participantsJson = JSON.stringify(
    validRows.map((r) => ({ player_id: r.player_id, squadra: r.squadra, gol: Number(r.gol) || 0 }))
  );
  const mvpValue = validRows.some((r) => r.player_id === mvp) ? mvp : "";

  const countWarning =
    validRows.length > 0 && (validRows.length < 10 || validRows.length > 20)
      ? `Attenzione: ${validRows.length} partecipanti (consigliati tra 10 e 20).`
      : null;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {matchId && <input type="hidden" name="id" value={matchId} />}
      <input type="hidden" name="participants" value={participantsJson} />

      <div className="sticky top-2 z-10 rounded-2xl border border-line-strong bg-surface/95 backdrop-blur p-4 flex items-center justify-center gap-4 shadow-lg">
        <span className="font-display text-sm text-muted">BIANCA</span>
        <span className="font-display text-2xl font-bold tabular-nums">
          {golBianca} – {golNera}
        </span>
        <span className="font-display text-sm text-muted">NERA</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="data">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border border-line bg-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="note">
            Note
          </label>
          <input
            id="note"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-line bg-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {countWarning && (
        <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          ⚠️ {countWarning}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.div
              key={row.key}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-xl border p-2.5 flex items-center gap-2 ${
                row.squadra === "bianca"
                  ? "border-line-strong bg-bianca-dim"
                  : "border-nera-line bg-nera"
              }`}
            >
              <select
                value={row.player_id}
                onChange={(e) => updateRow(row.key, { player_id: e.target.value })}
                className="flex-1 bg-transparent text-sm min-w-0 outline-none"
              >
                <option value="" className="bg-surface text-ink">
                  Seleziona giocatore…
                </option>
                {players
                  .filter((p) => p.id === row.player_id || !chosenIds.has(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id} className="bg-surface text-ink">
                      {p.cognome} {p.nome}
                    </option>
                  ))}
              </select>

              <div className="flex border border-line-strong rounded-lg overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => updateRow(row.key, { squadra: "bianca" })}
                  className={`tap px-2.5 py-1.5 text-xs font-bold ${
                    row.squadra === "bianca" ? "bg-bianca text-[#0a0a0b]" : "text-muted"
                  }`}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => updateRow(row.key, { squadra: "nera" })}
                  className={`tap px-2.5 py-1.5 text-xs font-bold ${
                    row.squadra === "nera" ? "bg-nera-line text-ink" : "text-muted"
                  }`}
                >
                  N
                </button>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => updateRow(row.key, { gol: Math.max(0, row.gol - 1) })}
                  className="tap w-7 h-7 rounded-full border border-line-strong flex items-center justify-center text-sm"
                  aria-label="Meno un gol"
                >
                  −
                </button>
                <span className="w-5 text-center font-display font-bold tabular-nums text-sm">
                  {row.gol}
                </span>
                <button
                  type="button"
                  onClick={() => updateRow(row.key, { gol: row.gol + 1 })}
                  className="tap w-7 h-7 rounded-full border border-line-strong flex items-center justify-center text-sm text-accent"
                  aria-label="Più un gol"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeRow(row.key)}
                className="tap text-muted hover:text-ink shrink-0 px-1 text-lg leading-none"
                aria-label="Rimuovi giocatore"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="tap text-sm font-medium border border-dashed border-line rounded-lg py-2.5 hover:border-line-strong"
      >
        + Aggiungi giocatore
      </button>

      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="mvp">
          MVP di giornata (opzionale)
        </label>
        <select
          id="mvp"
          name="mvp_player_id"
          value={mvpValue}
          onChange={(e) => setMvp(e.target.value)}
          className="w-full border border-line bg-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        >
          <option value="">Nessuno</option>
          {validRows.map((r) => {
            const p = players.find((pl) => pl.id === r.player_id);
            return p ? (
              <option key={p.id} value={p.id}>
                {p.nome} {p.cognome}
              </option>
            ) : null;
          })}
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="tap bg-accent text-[#06210f] rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : submitLabel}
      </button>
    </form>
  );
}
