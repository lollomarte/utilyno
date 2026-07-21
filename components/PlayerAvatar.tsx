import Image from "next/image";
import { initials } from "@/lib/format";

export function PlayerAvatar({
  player,
  size = 40,
}: {
  player: { nome: string; cognome: string; foto_url: string | null };
  size?: number;
}) {
  if (player.foto_url) {
    return (
      <Image
        src={player.foto_url}
        alt={`${player.nome} ${player.cognome}`}
        width={size}
        height={size}
        className="rounded-full object-cover border border-line shrink-0"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }

  return (
    <div
      className="rounded-full bg-nera text-paper flex items-center justify-center font-semibold shrink-0 border border-line"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(player)}
    </div>
  );
}
