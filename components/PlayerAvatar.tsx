import Image from "next/image";
import { initials } from "@/lib/format";

const ringByRank: Record<number, string> = {
  1: "ring-2 ring-gold shadow-[0_0_14px_rgba(232,185,35,0.45)]",
  2: "ring-2 ring-silver",
  3: "ring-2 ring-bronze",
};

export function PlayerAvatar({
  player,
  size = 40,
  rank,
}: {
  player: { nome: string; cognome: string; foto_url: string | null };
  size?: number;
  rank?: number;
}) {
  const ringClass = rank ? ringByRank[rank] ?? "" : "";

  if (player.foto_url) {
    return (
      <Image
        src={player.foto_url}
        alt={`${player.nome} ${player.cognome}`}
        width={size}
        height={size}
        className={`rounded-full object-cover border border-line shrink-0 ${ringClass}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-surface-2 text-ink flex items-center justify-center font-display font-semibold shrink-0 border border-line ${ringClass}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(player)}
    </div>
  );
}
