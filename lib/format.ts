import type { Ruolo } from "@/lib/types";

export function playerName(p: { nome: string; cognome: string }): string {
  return `${p.nome} ${p.cognome}`;
}

export const ruoloLabel: Record<Ruolo, string> = {
  difensore: "Difensore",
  centrocampista: "Centrocampista",
  attaccante: "Attaccante",
};

export function formatMarketValue(valore: number): string {
  return `€${valore.toFixed(1)}M`;
}

export interface MarketTier {
  label: string;
  className: string;
}

export function marketTier(valore: number): MarketTier {
  if (valore < 1) return { label: "Riserva", className: "text-muted bg-surface-2 border-line-strong" };
  if (valore < 3) return { label: "Solido", className: "text-sky-300 bg-sky-500/10 border-sky-500/30" };
  if (valore < 6)
    return {
      label: "Panchinaro di lusso",
      className: "text-violet-300 bg-violet-500/10 border-violet-500/30",
    };
  if (valore <= 10)
    return { label: "Titolarissimo", className: "text-accent bg-accent-dim border-accent-strong/40" };
  return { label: "Fenomeno", className: "text-gold bg-gold/10 border-gold/40" };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(p: { nome: string; cognome: string }): string {
  return `${p.nome[0] ?? ""}${p.cognome[0] ?? ""}`.toUpperCase();
}

export function age(dataNascita: string): number {
  const birth = new Date(dataNascita);
  const today = new Date();
  let years = today.getUTCFullYear() - birth.getUTCFullYear();
  const hasHadBirthdayThisYear =
    today.getUTCMonth() > birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() >= birth.getUTCDate());
  if (!hasHadBirthdayThisYear) years -= 1;
  return years;
}
