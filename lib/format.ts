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

interface MarketTierDef extends MarketTier {
  /** Soglia superiore esclusiva, in milioni. */
  max: number;
}

// Una fascia ogni 5M, con una progressione di colore che sale d'intensità
// insieme al valore: dal neutro delle riserve fino al Pallone d'Oro, unica
// fascia aperta oltre i 100M e trattata a parte con l'oro.
const MARKET_TIERS: MarketTierDef[] = [
  { max: 5, label: "Raccattapalle", className: "text-muted bg-surface-2 border-line-strong" },
  { max: 10, label: "Ultimo cambio", className: "text-zinc-300 bg-zinc-500/10 border-zinc-500/30" },
  { max: 15, label: "Panchinaro", className: "text-stone-300 bg-stone-500/10 border-stone-500/30" },
  { max: 20, label: "Jolly di squadra", className: "text-sky-300 bg-sky-500/10 border-sky-500/30" },
  { max: 25, label: "Titolare precario", className: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30" },
  { max: 30, label: "Titolare", className: "text-teal-300 bg-teal-500/10 border-teal-500/30" },
  {
    max: 35,
    label: "Titolare inamovibile",
    className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  },
  { max: 40, label: "Uomo squadra", className: "text-green-300 bg-green-500/10 border-green-500/30" },
  { max: 45, label: "Trascinatore", className: "text-lime-300 bg-lime-500/10 border-lime-500/30" },
  { max: 50, label: "Capitano", className: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30" },
  {
    max: 55,
    label: "Fenomeno di quartiere",
    className: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  },
  { max: 60, label: "Idolo di curva", className: "text-orange-300 bg-orange-500/10 border-orange-500/30" },
  { max: 65, label: "Bandiera", className: "text-red-300 bg-red-500/10 border-red-500/30" },
  { max: 70, label: "Top player", className: "text-rose-300 bg-rose-500/10 border-rose-500/30" },
  { max: 75, label: "Fuoriclasse", className: "text-pink-300 bg-pink-500/10 border-pink-500/30" },
  { max: 80, label: "Campione", className: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30" },
  { max: 85, label: "Stella", className: "text-purple-300 bg-purple-500/10 border-purple-500/30" },
  { max: 90, label: "Superstar", className: "text-violet-300 bg-violet-500/10 border-violet-500/30" },
  { max: 95, label: "Mito", className: "text-indigo-300 bg-indigo-500/10 border-indigo-500/30" },
  { max: 100, label: "Leggenda", className: "text-blue-300 bg-blue-500/10 border-blue-500/30" },
];

const PALLONE_DORO: MarketTier = {
  label: "Pallone d'Oro",
  className: "text-gold bg-gold/10 border-gold/40 shadow-[0_0_10px_rgba(232,185,35,0.35)]",
};

export function marketTier(valore: number): MarketTier {
  return MARKET_TIERS.find((t) => valore < t.max) ?? PALLONE_DORO;
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
