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
  if (valore < 1) return { label: "Esordiente", className: "text-muted bg-surface-2 border-line-strong" };
  if (valore < 3) return { label: "Primavera", className: "text-sky-300 bg-sky-500/10 border-sky-500/30" };
  if (valore < 5) return { label: "Panchinaro", className: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30" };
  if (valore < 10) return { label: "Titolare", className: "text-teal-300 bg-teal-500/10 border-teal-500/30" };
  if (valore < 25)
    return { label: "Pilastro", className: "text-accent bg-accent-dim border-accent-strong/40" };
  if (valore < 50)
    return { label: "Capitano", className: "text-violet-300 bg-violet-500/10 border-violet-500/30" };
  if (valore < 90)
    return { label: "Fenomeno", className: "text-amber-300 bg-amber-500/10 border-amber-500/30" };
  if (valore < 150)
    return { label: "Fuoriclasse", className: "text-orange-300 bg-orange-500/10 border-orange-500/30" };
  return {
    label: "Pallone d'Oro",
    className: "text-gold bg-gold/10 border-gold/40 shadow-[0_0_10px_rgba(232,185,35,0.35)]",
  };
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

export function monthLabel(meseKey: string): string {
  const [y, m] = meseKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
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
