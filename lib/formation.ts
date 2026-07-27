import type { MarketValue } from "@/lib/data/market";
import type { Squadra } from "@/lib/types";

export interface FormationTeam {
  squadra: Squadra;
  players: MarketValue[];
  totale: number;
}

export interface FormationResult {
  bianchi: FormationTeam;
  neri: FormationTeam;
  differenza: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Divide i giocatori selezionati in due squadre bilanciate: ordina per
 * valore di mercato decrescente e alterna l'assegnazione a coppie invertite
 * ("serpentina" 1-2-2-1) così ogni blocco di 4 giocatori pesa uguale sulle
 * due squadre, senza bisogno di un algoritmo di ottimizzazione complesso.
 * Uno shuffle preliminare (spareggia i valori a parità) più il lato di
 * partenza scelto a caso fanno sì che rigenerare con la stessa lista dia
 * quasi sempre una divisione diversa.
 */
export function generateBalancedTeams(selected: MarketValue[]): FormationResult {
  const shuffled = shuffle(selected);
  const sorted = shuffled.slice().sort((a, b) => b.valore - a.valore);

  const startWithBianca = Math.random() < 0.5;
  const pattern: Squadra[] = startWithBianca
    ? ["bianca", "nera", "nera", "bianca"]
    : ["nera", "bianca", "bianca", "nera"];

  const bianchi: MarketValue[] = [];
  const neri: MarketValue[] = [];
  sorted.forEach((mv, i) => {
    (pattern[i % 4] === "bianca" ? bianchi : neri).push(mv);
  });

  const totaleBianchi = round1(bianchi.reduce((s, p) => s + p.valore, 0));
  const totaleNeri = round1(neri.reduce((s, p) => s + p.valore, 0));

  return {
    bianchi: { squadra: "bianca", players: bianchi, totale: totaleBianchi },
    neri: { squadra: "nera", players: neri, totale: totaleNeri },
    differenza: round1(Math.abs(totaleBianchi - totaleNeri)),
  };
}
