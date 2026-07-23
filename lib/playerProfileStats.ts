// Statistiche di dettaglio per la pagina profilo giocatore: nessuna query qui
// dentro, solo calcolo puro a partire dai dati già recuperati dal server
// (storico partite del giocatore + elenco di tutte le partite della lega).
import type { PlayerMatchResult } from "@/lib/types";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function ascByData<T extends { data: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.data.localeCompare(b.data));
}

function teamGoals(row: PlayerMatchResult): { fatti: number; subiti: number } {
  return row.squadra === "bianca"
    ? { fatti: row.gol_bianca, subiti: row.gol_nera }
    : { fatti: row.gol_nera, subiti: row.gol_bianca };
}

function currentStreak<T>(ascRows: T[], predicate: (row: T) => boolean): number {
  let count = 0;
  for (let i = ascRows.length - 1; i >= 0; i--) {
    if (!predicate(ascRows[i])) break;
    count++;
  }
  return count;
}

function longestStreak<T>(ascRows: T[], predicate: (row: T) => boolean): number {
  let max = 0;
  let running = 0;
  for (const row of ascRows) {
    if (predicate(row)) {
      running++;
      max = Math.max(max, running);
    } else {
      running = 0;
    }
  }
  return max;
}

export interface MatchRef {
  matchId: string;
  data: string;
}

export interface AttackStats {
  golPersonali: number;
  golSquadraTotali: number;
  golSubitiTotali: number;
  differenzaReti: number;
  mediaGolSquadra: number;
  mediaGolSubiti: number;
  miglioreAttacco: (MatchRef & { golSquadra: number }) | null;
  peggioreDifesa: (MatchRef & { golSubiti: number }) | null;
}

export function computeAttackStats(history: PlayerMatchResult[]): AttackStats {
  const presenze = history.length;
  let golSquadraTotali = 0;
  let golSubitiTotali = 0;
  let miglioreAttacco: AttackStats["miglioreAttacco"] = null;
  let peggioreDifesa: AttackStats["peggioreDifesa"] = null;

  for (const row of history) {
    const { fatti, subiti } = teamGoals(row);
    golSquadraTotali += fatti;
    golSubitiTotali += subiti;
    if (!miglioreAttacco || fatti > miglioreAttacco.golSquadra) {
      miglioreAttacco = { golSquadra: fatti, matchId: row.match_id, data: row.data };
    }
    if (!peggioreDifesa || subiti > peggioreDifesa.golSubiti) {
      peggioreDifesa = { golSubiti: subiti, matchId: row.match_id, data: row.data };
    }
  }

  return {
    golPersonali: history.reduce((s, r) => s + r.gol, 0),
    golSquadraTotali,
    golSubitiTotali,
    differenzaReti: golSquadraTotali - golSubitiTotali,
    mediaGolSquadra: presenze > 0 ? round2(golSquadraTotali / presenze) : 0,
    mediaGolSubiti: presenze > 0 ? round2(golSubitiTotali / presenze) : 0,
    miglioreAttacco,
    peggioreDifesa,
  };
}

export interface RendimentoStats {
  vittorie: number;
  pareggi: number;
  sconfitte: number;
  percentualeVittorie: number;
  strisciaVittorieAttuale: number;
  strisciaVittorieRecord: number;
  strisciaImbattibilitaAttuale: number;
  strisciaImbattibilitaRecord: number;
  mvpTotali: number;
  percentualeMvp: number;
}

export function computeRendimentoStats(history: PlayerMatchResult[], mvpTotali: number): RendimentoStats {
  const presenze = history.length;
  const asc = ascByData(history);
  const vittorie = history.filter((r) => r.esito === "vittoria").length;
  const pareggi = history.filter((r) => r.esito === "pareggio").length;
  const sconfitte = history.filter((r) => r.esito === "sconfitta").length;

  return {
    vittorie,
    pareggi,
    sconfitte,
    percentualeVittorie: presenze > 0 ? round1((vittorie / presenze) * 100) : 0,
    strisciaVittorieAttuale: currentStreak(asc, (r) => r.esito === "vittoria"),
    strisciaVittorieRecord: longestStreak(asc, (r) => r.esito === "vittoria"),
    strisciaImbattibilitaAttuale: currentStreak(asc, (r) => r.esito !== "sconfitta"),
    strisciaImbattibilitaRecord: longestStreak(asc, (r) => r.esito !== "sconfitta"),
    mvpTotali,
    percentualeMvp: presenze > 0 ? round1((mvpTotali / presenze) * 100) : 0,
  };
}

export interface ContinuitaStats {
  presenze: number;
  percentualePresenza: number;
  strisciaPresenzeAttuale: number;
  strisciaPresenzeRecord: number;
  migliorMese: { meseKey: string; presenze: number } | null;
}

export function computeContinuitaStats(
  history: PlayerMatchResult[],
  allMatches: { id: string; data: string }[],
  totalMatches: number
): ContinuitaStats {
  const presenze = history.length;
  const playedIds = new Set(history.map((r) => r.match_id));
  const ascAllMatches = ascByData(allMatches);

  const strisciaPresenzeAttuale = currentStreak(ascAllMatches, (m) => playedIds.has(m.id));
  const strisciaPresenzeRecord = longestStreak(ascAllMatches, (m) => playedIds.has(m.id));

  const monthCounts = new Map<string, number>();
  for (const row of history) {
    const key = row.data.slice(0, 7); // YYYY-MM
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  let migliorMese: ContinuitaStats["migliorMese"] = null;
  for (const [meseKey, count] of monthCounts) {
    if (!migliorMese || count > migliorMese.presenze) {
      migliorMese = { meseKey, presenze: count };
    }
  }

  return {
    presenze,
    percentualePresenza: totalMatches > 0 ? round1((presenze / totalMatches) * 100) : 0,
    strisciaPresenzeAttuale,
    strisciaPresenzeRecord,
    migliorMese,
  };
}

export function findRank<T>(rankedList: T[], predicate: (item: T) => boolean): number | null {
  const idx = rankedList.findIndex(predicate);
  return idx === -1 ? null : idx + 1;
}
