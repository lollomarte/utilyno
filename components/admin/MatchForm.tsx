"use client";

import { useActionState, useState } from "react";
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
    setRows((r) => [
      ...r,
      { key: crypto.randomUUID(), player_id: "", squadra: "bianca", gol: 0 },
    ]);
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
            className="w-full border border-line rounded-lg px-3 py-2 text-sm"
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
            className="w-full border border-line rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-line p-4 flex items-center justify-center gap-4 text-xl font-bold tabular-nums">
        <span>Bianca {golBianca}</span>
        <span className="text-muted text-base font-normal">–</span>
        <span>{golNera} Nera</span>
      </div>

      {countWarning && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {countWarning}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2">
            <select
              value={row.player_id}
              onChange={(e) => updateRow(row.key, { player_id: e.target.value })}
              className="flex-1 border border-line rounded-lg px-2 py-2 text-sm min-w-0"
            >
              <option value="">Seleziona giocatore…</option>
              {players
                .filter((p) => p.id === row.player_id || !chosenIds.has(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.cognome} {p.nome}
                  </option>
                ))}
            </select>
            <div className="flex border border-line rounded-lg overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => updateRow(row.key, { squadra: "bianca" })}
                className={`px-2.5 py-2 text-xs font-semibold ${
                  row.squadra === "bianca" ? "bg-bianca" : "text-muted"
                }`}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => updateRow(row.key, { squadra: "nera" })}
                className={`px-2.5 py-2 text-xs font-semibold ${
                  row.squadra === "nera" ? "bg-nera text-paper" : "text-muted"
                }`}
              >
                N
              </button>
            </div>
            <input
              type="number"
              min={0}
              value={row.gol}
              onChange={(e) => updateRow(row.key, { gol: Number(e.target.value) })}
              className="w-14 border border-line rounded-lg px-2 py-2 text-sm shrink-0"
            />
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="text-muted hover:text-ink shrink-0 px-1 text-lg leading-none"
              aria-label="Rimuovi giocatore"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="text-sm font-medium border border-dashed border-line rounded-lg py-2 hover:border-ink"
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
          className="w-full border border-line rounded-lg px-3 py-2 text-sm"
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

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : submitLabel}
      </button>
    </form>
  );
}
