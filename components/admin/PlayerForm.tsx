"use client";

import { useActionState } from "react";
import { savePlayer } from "@/lib/actions/players";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { Player } from "@/lib/types";

export function PlayerForm({ player }: { player?: Player }) {
  const [state, formAction, pending] = useActionState(savePlayer, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      {player && <input type="hidden" name="id" value={player.id} />}
      <input type="hidden" name="foto_url_existing" value={player?.foto_url ?? ""} />

      <div className="flex items-center gap-3">
        <PlayerAvatar
          player={{
            nome: player?.nome ?? "?",
            cognome: player?.cognome ?? "?",
            foto_url: player?.foto_url ?? null,
          }}
          size={56}
        />
        <div className="flex-1">
          <label className="text-sm font-medium block mb-1" htmlFor="foto">
            Foto
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/*"
            className="w-full text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="nome">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={player?.nome}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="cognome">
          Cognome
        </label>
        <input
          id="cognome"
          name="cognome"
          required
          defaultValue={player?.cognome}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" htmlFor="data_nascita">
          Data di nascita
        </label>
        <input
          id="data_nascita"
          name="data_nascita"
          type="date"
          defaultValue={player?.data_nascita ?? ""}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="attivo"
          defaultChecked={player?.attivo ?? true}
          className="w-4 h-4"
        />
        Attivo
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : "Salva"}
      </button>
    </form>
  );
}
