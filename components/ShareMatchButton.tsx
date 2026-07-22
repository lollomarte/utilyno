"use client";

import { useToast } from "@/components/Toast";
import { formatDate, playerName } from "@/lib/format";

export interface ShareableMatch {
  data: string;
  gol_bianca: number;
  gol_nera: number;
  participants: { gol: number; player: { nome: string; cognome: string } }[];
}

function buildShareText(match: ShareableMatch): string {
  const topScorers = [...match.participants]
    .filter((p) => p.gol > 0)
    .sort((a, b) => b.gol - a.gol)
    .slice(0, 5);

  const lines = [
    `⚽ Calciotto del Lunedì – ${formatDate(match.data)}`,
    `Bianchi ${match.gol_bianca} – ${match.gol_nera} Neri`,
  ];

  if (topScorers.length > 0) {
    lines.push("");
    lines.push("Marcatori: " + topScorers.map((p) => `${playerName(p.player)} (${p.gol})`).join(", "));
  }

  return lines.join("\n");
}

export function ShareMatchButton({ match }: { match: ShareableMatch }) {
  const { push } = useToast();

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const text = buildShareText(match);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // utente ha annullato la condivisione, nessuna azione necessaria
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      push("Testo copiato negli appunti");
    } catch {
      push("Impossibile copiare il testo", "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="tap flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink border border-line rounded-full px-2.5 py-1 hover:border-line-strong transition-colors"
      aria-label="Condividi risultato"
    >
      <ShareIcon />
      Condividi
    </button>
  );
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
      <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
    </svg>
  );
}
