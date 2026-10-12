import type { Ruolo } from "@/lib/types";

export function playerName(p: { nome: string; cognome: string }): string {
  return `${p.nome} ${p.cognome}`;
}

export const ruoloLabel: Record<Ruolo, string> = {
  difensore: "Difensore",
  centrocampista: "Centrocampista",
  attaccante: "Attaccante",
};

/** Decimali con la virgola, come da convenzione italiana (21,17 non 21.17). */
export function formatDecimal(value: number, decimals = 1): string {
  return value.toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatMarketValue(valore: number): string {
  return `€${formatDecimal(valore, 1)}M`;
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
  { max: 10, label: "Ultimo cambio", className: "text-zinc-800 bg-zinc-500/15 border-zinc-600/40" },
  { max: 15, label: "Panchinaro", className: "text-stone-800 bg-stone-500/15 border-stone-600/40" },
  { max: 20, label: "Jolly di squadra", className: "text-sky-800 bg-sky-500/15 border-sky-600/40" },
  { max: 25, label: "Titolare precario", className: "text-cyan-800 bg-cyan-500/15 border-cyan-600/40" },
  { max: 30, label: "Titolare", className: "text-teal-800 bg-teal-500/15 border-teal-600/40" },
  {
    max: 35,
    label: "Titolare inamovibile",
    className: "text-emerald-800 bg-emerald-500/15 border-emerald-600/40",
  },
  { max: 40, label: "Uomo squadra", className: "text-green-800 bg-green-500/15 border-green-600/40" },
  { max: 45, label: "Trascinatore", className: "text-lime-800 bg-lime-500/15 border-lime-600/40" },
  { max: 50, label: "Capitano", className: "text-yellow-800 bg-yellow-500/15 border-yellow-600/40" },
  {
    max: 55,
    label: "Fenomeno di quartiere",
    className: "text-amber-800 bg-amber-500/15 border-amber-600/40",
  },
  { max: 60, label: "Idolo di curva", className: "text-orange-800 bg-orange-500/15 border-orange-600/40" },
  { max: 65, label: "Bandiera", className: "text-red-800 bg-red-500/15 border-red-600/40" },
  { max: 70, label: "Top player", className: "text-rose-800 bg-rose-500/15 border-rose-600/40" },
  { max: 75, label: "Fuoriclasse", className: "text-pink-800 bg-pink-500/15 border-pink-600/40" },
  { max: 80, label: "Campione", className: "text-fuchsia-800 bg-fuchsia-500/15 border-fuchsia-600/40" },
  { max: 85, label: "Stella", className: "text-purple-800 bg-purple-500/15 border-purple-600/40" },
  { max: 90, label: "Superstar", className: "text-violet-800 bg-violet-500/15 border-violet-600/40" },
  { max: 95, label: "Mito", className: "text-indigo-800 bg-indigo-500/15 border-indigo-600/40" },
  { max: 100, label: "Leggenda", className: "text-blue-800 bg-blue-500/15 border-blue-600/40" },
];

const PALLONE_DORO: MarketTier = {
  label: "Pallone d'Oro",
  className: "text-gold bg-gold/10 border-gold/40 shadow-[0_0_8px_rgba(143,100,0,0.3)]",
};

// Etichetta scherzosa che sovrascrive la fascia normale quando il giocatore
// ha il flag is_clown: cambia solo il badge, il valore numerico e la
// posizione in classifica restano quelli calcolati dalla formula.
const CLOWN_TIER: MarketTier = {
  label: "🤡 Clown",
  className:
    "text-white bg-gradient-to-r from-fuchsia-500 via-purple-500 to-amber-400 border-dashed border-ink/40",
};

export function marketTier(valore: number, isClown = false): MarketTier {
  if (isClown) return CLOWN_TIER;
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

function capitalizeWords(str: string): string {
  return str.replace(/\p{L}+/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

/** Formato italiano compatto stile "Lun 4 Ago 2026", usato in liste e card. */
export function formatDateShort(dateStr: string): string {
  const formatted = new Date(dateStr).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return capitalizeWords(formatted.replace(/\./g, ""));
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
