"use client";

import { useRouter, usePathname } from "next/navigation";
import { PlayerSearchSelect } from "@/components/PlayerSearchSelect";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PitchLines } from "@/components/PitchLines";
import { playerName } from "@/lib/format";
import type { Player } from "@/lib/types";

export function PlayerVsPicker({
  players,
  idA,
  idB,
}: {
  players: Player[];
  idA?: string;
  idB?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const playerA = players.find((p) => p.id === idA) ?? null;
  const playerB = players.find((p) => p.id === idB) ?? null;

  function update(next: { a?: string; b?: string }) {
    const a = next.a !== undefined ? next.a : idA;
    const b = next.b !== undefined ? next.b : idB;
    const params = new URLSearchParams();
    if (a) params.set("a", a);
    if (b) params.set("b", b);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-5 sm:p-6 relative">
      <PitchLines />
      <div className="relative flex items-center justify-center gap-2 sm:gap-6">
        <PickerSlot
          player={playerA}
          players={players.filter((p) => p.id !== idB)}
          onChange={(id) => update({ a: id })}
          placeholder="Giocatore A"
        />

        <span className="font-display text-xl sm:text-4xl font-bold text-muted shrink-0">VS</span>

        <PickerSlot
          player={playerB}
          players={players.filter((p) => p.id !== idA)}
          onChange={(id) => update({ b: id })}
          placeholder="Giocatore B"
        />
      </div>
    </div>
  );
}

function PickerSlot({
  player,
  players,
  onChange,
  placeholder,
}: {
  player: Player | null;
  players: Player[];
  onChange: (id: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0 max-w-[9.5rem] sm:max-w-none">
      <PlayerAvatar player={player ?? { nome: "?", cognome: "", foto_url: null }} size={64} />
      {player && <span className="text-sm font-semibold truncate max-w-full">{playerName(player)}</span>}
      <PlayerSearchSelect
        players={players}
        value={player?.id ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        showAvatar
      />
    </div>
  );
}
