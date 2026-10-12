import Image from "next/image";
import { initials, ruoloLabel } from "@/lib/format";
import { currentSeason } from "@/lib/season";
import type { Ruolo } from "@/lib/types";

/**
 * Figurina in stile album Panini anni '90: cartoncino bianco, fondo "cielo"
 * con il prato in basso, foto del giocatore, scudetto con il numero (di
 * solito la posizione in classifica), banda rossa con il cognome in giallo e
 * banda blu con nome e ruolo. `foil` la trasforma nella figurina speciale
 * dorata, con il riflesso che scorre.
 *
 * Tutte le misure interne sono in cqw (container query width), così la
 * figurina si ridimensiona dal solo `className` del contenitore (w-40, w-full…).
 */
export function PaniniSticker({
  player,
  number,
  foil = false,
  className = "",
  sizes = "(max-width: 640px) 50vw, 240px",
}: {
  player: { nome: string; cognome: string; foto_url: string | null; ruolo?: Ruolo | null; attivo?: boolean };
  number?: number | null;
  foil?: boolean;
  className?: string;
  sizes?: string;
}) {
  const season = currentSeason().replace(/20(\d\d)\/20(\d\d)/, "$1/$2");
  const inactive = player.attivo === false;

  return (
    <div className={`relative aspect-[5/7] ${className}`} style={{ containerType: "inline-size" }}>
      <div
        className={`panini-sticker h-full w-full rounded-[4cqw] ${foil ? "panini-foil" : "bg-white"}`}
        style={{ padding: "5cqw" }}
      >
      <div className="relative h-full w-full overflow-hidden rounded-[2cqw] bg-[linear-gradient(180deg,#7fb8e0_0%,#cfe6f5_58%,#3f8f4e_58%,#2f7a3e_100%)]">
        {/* Foto (o iniziali) */}
        <div className="absolute inset-x-0 top-0 bottom-[24%]">
          {player.foto_url ? (
            <Image
              src={player.foto_url}
              alt={`${player.nome} ${player.cognome}`}
              fill
              sizes={sizes}
              className={`object-cover object-top ${inactive ? "grayscale" : ""}`}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-display font-bold text-white/90"
              style={{ fontSize: "34cqw", textShadow: "0.6cqw 0.8cqw 0 rgba(29,79,145,0.45)" }}
              aria-hidden
            >
              {initials(player)}
            </div>
          )}
        </div>

        {/* Scudetto con il numero */}
        {number != null && (
          <svg
            viewBox="0 0 40 46"
            className="absolute"
            style={{ left: "4cqw", top: "4cqw", width: "20cqw" }}
            aria-hidden
          >
            <path
              d="M20 1 38 6v15c0 11-7.6 19.4-18 24C9.6 40.4 2 32 2 21V6Z"
              fill="var(--color-album-red)"
              stroke="#fff"
              strokeWidth={2.5}
            />
            <text
              x="20"
              y="29"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontWeight={700}
              fontSize={number > 99 ? 13 : 19}
              fill="var(--color-album-yellow)"
            >
              {number}
            </text>
          </svg>
        )}

        {/* Stagione, verticale nell'angolo come sulle figurine vere */}
        <span
          className="absolute font-display font-semibold text-album-blue/80 [writing-mode:vertical-rl]"
          style={{ right: "3cqw", top: "4cqw", fontSize: "6cqw", letterSpacing: "0.1em" }}
          aria-hidden
        >
          {season}
        </span>

        {/* Bande nome */}
        <div className="absolute inset-x-0 bottom-0 bg-album-blue">
          <div
            className="-skew-y-3 origin-bottom-left bg-album-red shadow-[0_-0.5cqw_0_rgba(255,255,255,0.9)]"
            style={{ padding: "1.5cqw 5cqw 1cqw" }}
          >
            <p
              className="skew-y-3 truncate font-display font-bold uppercase leading-none text-album-yellow"
              style={{ fontSize: player.cognome.length > 11 ? "11cqw" : "14cqw" }}
            >
              {player.cognome}
            </p>
          </div>
          <div
            className="flex items-baseline justify-between gap-[2cqw] bg-album-blue text-white"
            style={{ padding: "1.5cqw 5cqw 2.5cqw" }}
          >
            <span className="truncate font-semibold uppercase" style={{ fontSize: "7cqw" }}>
              {player.nome}
            </span>
            {player.ruolo && (
              <span className="shrink-0 uppercase opacity-85" style={{ fontSize: "5.5cqw" }} title={ruoloLabel[player.ruolo]}>
                {ruoloShort[player.ruolo]}
              </span>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

const ruoloShort: Record<Ruolo, string> = {
  difensore: "Dif",
  centrocampista: "Cen",
  attaccante: "Att",
};
