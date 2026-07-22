"use client";

import { useActionState, useState } from "react";
import { PlayerSlotSelect } from "@/components/admin/PlayerSlotSelect";
import type { Player, Squadra } from "@/lib/types";

const SLOT_COUNT = 8;

interface Row {
  key: string;
  player_id: string;
  squadra: Squadra;
  gol: number;
}

interface Slot {
  player_id: string;
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

function buildSlots(rows: Row[] | undefined, squadra: Squadra): Slot[] {
  const filtered = (rows ?? [])
    .filter((r) => r.squadra === squadra)
    .map((r) => ({ player_id: r.player_id, gol: r.gol }));
  const slots = [...filtered];
  while (slots.length < SLOT_COUNT) slots.push({ player_id: "", gol: 0 });
  return slots;
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
  const [biancaSlots, setBiancaSlots] = useState<Slot[]>(() => buildSlots(initialRows, "bianca"));
  const [neraSlots, setNeraSlots] = useState<Slot[]>(() => buildSlots(initialRows, "nera"));

  function updateSlot(squadra: Squadra, index: number, patch: Partial<Slot>) {
    const setter = squadra === "bianca" ? setBiancaSlots : setNeraSlots;
    setter((slots) => slots.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  const golBianca = biancaSlots
    .filter((s) => s.player_id)
    .reduce((sum, s) => sum + (Number(s.gol) || 0), 0);
  const golNera = neraSlots
    .filter((s) => s.player_id)
    .reduce((sum, s) => sum + (Number(s.gol) || 0), 0);

  const validParticipants = [
    ...biancaSlots
      .filter((s) => s.player_id)
      .map((s) => ({ player_id: s.player_id, squadra: "bianca" as const, gol: Number(s.gol) || 0 })),
    ...neraSlots
      .filter((s) => s.player_id)
      .map((s) => ({ player_id: s.player_id, squadra: "nera" as const, gol: Number(s.gol) || 0 })),
  ];
  const chosenIds = new Set(validParticipants.map((p) => p.player_id));
  const participantsJson = JSON.stringify(validParticipants);
  const mvpValue = validParticipants.some((p) => p.player_id === mvp) ? mvp : "";

  const countWarning =
    validParticipants.length > 0 && (validParticipants.length < 10 || validParticipants.length > 20)
      ? `Attenzione: ${validParticipants.length} partecipanti (consigliati tra 10 e 20).`
      : null;

  function excludeIdsFor(currentId: string) {
    const ids = new Set(chosenIds);
    if (currentId) ids.delete(currentId);
    return ids;
  }

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xs font-bold text-center py-1.5 rounded-lg bg-bianca-dim border border-line-strong">
            SQUADRA BIANCA
          </h2>
          {biancaSlots.map((slot, i) => (
            <SlotRow
              key={i}
              slot={slot}
              players={players}
              excludeIds={excludeIdsFor(slot.player_id)}
              squadraStyle="border-line-strong bg-bianca-dim"
              onPlayerChange={(player_id) => updateSlot("bianca", i, { player_id })}
              onGolChange={(gol) => updateSlot("bianca", i, { gol })}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xs font-bold text-center py-1.5 rounded-lg bg-nera border border-nera-line">
            SQUADRA NERA
          </h2>
          {neraSlots.map((slot, i) => (
            <SlotRow
              key={i}
              slot={slot}
              players={players}
              excludeIds={excludeIdsFor(slot.player_id)}
              squadraStyle="border-nera-line bg-nera"
              onPlayerChange={(player_id) => updateSlot("nera", i, { player_id })}
              onGolChange={(gol) => updateSlot("nera", i, { gol })}
            />
          ))}
        </div>
      </div>

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
          {validParticipants.map((p) => {
            const pl = players.find((pp) => pp.id === p.player_id);
            return pl ? (
              <option key={pl.id} value={pl.id}>
                {pl.nome} {pl.cognome}
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

function SlotRow({
  slot,
  players,
  excludeIds,
  squadraStyle,
  onPlayerChange,
  onGolChange,
}: {
  slot: Slot;
  players: Player[];
  excludeIds: Set<string>;
  squadraStyle: string;
  onPlayerChange: (playerId: string) => void;
  onGolChange: (gol: number) => void;
}) {
  const filled = Boolean(slot.player_id);

  return (
    <div className={`rounded-xl border p-2.5 flex items-center gap-2 ${squadraStyle}`}>
      <PlayerSlotSelect
        players={players}
        value={slot.player_id}
        onChange={onPlayerChange}
        excludeIds={excludeIds}
      />

      <div className={`flex items-center gap-1 shrink-0 ${filled ? "" : "opacity-40"}`}>
        <button
          type="button"
          disabled={!filled}
          onClick={() => onGolChange(Math.max(0, slot.gol - 1))}
          className="tap w-7 h-7 rounded-full border border-line-strong flex items-center justify-center text-sm disabled:cursor-not-allowed"
          aria-label="Meno un gol"
        >
          −
        </button>
        <span className="w-5 text-center font-display font-bold tabular-nums text-sm">{slot.gol}</span>
        <button
          type="button"
          disabled={!filled}
          onClick={() => onGolChange(slot.gol + 1)}
          className="tap w-7 h-7 rounded-full border border-line-strong flex items-center justify-center text-sm text-accent disabled:cursor-not-allowed"
          aria-label="Più un gol"
        >
          +
        </button>
      </div>
    </div>
  );
}
