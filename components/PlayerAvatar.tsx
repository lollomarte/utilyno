import Image from "next/image";
import { initials } from "@/lib/format";

// Cornice da figurina: bordo bianco + filo d'inchiostro; sul podio il filo
// diventa oro/argento/bronzo come le figurine "speciali" dell'album.
const ringByRank: Record<number, string> = {
  1: "ring-2 ring-gold ring-offset-1 ring-offset-surface",
  2: "ring-2 ring-silver ring-offset-1 ring-offset-surface",
  3: "ring-2 ring-bronze ring-offset-1 ring-offset-surface",
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
        className={`sticker-frame rounded-full object-cover shrink-0 bg-surface-3 ${ringClass}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`sticker-frame rounded-full bg-surface-3 text-ink flex items-center justify-center font-display font-semibold uppercase shrink-0 ${ringClass}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(player)}
    </div>
  );
}
