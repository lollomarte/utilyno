"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { savePlayer } from "@/lib/actions/players";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import type { Player } from "@/lib/types";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function PlayerForm({ player }: { player?: Player }) {
  const [state, formAction, pending] = useActionState(savePlayer, undefined);
  const [photoError, setPhotoError] = useState<string | null>(null);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoError(null);
      return;
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Formato immagine non supportato. Usa JPEG, PNG, WEBP o GIF.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("La foto supera i 5MB consentiti. Scegli un file più leggero.");
      e.target.value = "";
      return;
    }
    setPhotoError(null);
  }

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
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handlePhotoChange}
            className="w-full text-sm"
          />
          {photoError && <p className="text-sm text-red-400 mt-1">{photoError}</p>}
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
          className="w-full border border-line bg-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
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
          className="w-full border border-line bg-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
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
          className="w-full border border-line bg-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="attivo"
          defaultChecked={player?.attivo ?? true}
          className="w-4 h-4 accent-[var(--color-accent)]"
        />
        Attivo
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="tap bg-accent text-[#06210f] rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : "Salva"}
      </button>
    </form>
  );
}
