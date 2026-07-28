import { createClient } from "@/lib/supabase/server";
import { getAllMatchResults } from "@/lib/data/matches";
import { fetchAllPages } from "@/lib/data/pagination";
import {
  getAllParticipantsWithPlayers,
  getMatchesAsc,
  getMatchResultsById,
  getYearTaggedParticipants,
} from "@/lib/data/stats";
import { yearOf } from "@/lib/season";
import type { Player } from "@/lib/types";
import {
  computeAttendanceStreakRecord,
  computeBestGoalMonth,
  computeBiggestBlowout,
  computeBiggestTotalGoalsMatch,
  computeCurrentYearVsRecordYear,
  computeDecano,
  computeFedele,
  computeGoleadaLeaders,
  computeGroupTotals,
  computeMostFrequentOpponents,
  computeMostFrequentPair,
  computeRecordGoliPartita,
  computeUnbeatenStreakRecord,
  computeWinStreakRecord,
  goleadaWinnerByMatch,
  type CurrentYearVsRecord,
  type GroupTotals,
  type MatchRecord,
  type MonthGoalsRecord,
  type PairRecord,
  type PlayerHolderRecord,
  type PlayerLite,
  type SingleMatchGoalEntry,
} from "@/lib/recordStats";

export interface GoleadaStanding {
  player: Pick<Player, "id" | "nome" | "cognome" | "foto_url">;
  count: number;
}

export interface GoleadeStats {
  totalGoleade: number;
  topWinners: GoleadaStanding[];
  topLosers: GoleadaStanding[];
}

export async function getGoleadeStats(): Promise<GoleadeStats> {
  const supabase = await createClient();
  const [{ data: results, error: resultsError }, participants] = await Promise.all([
    supabase.from("match_results").select("match_id, gol_bianca, gol_nera"),
    fetchAllPages<unknown>((from, to) =>
      supabase
        .from("match_participants")
        .select("match_id, squadra, players(id, nome, cognome, foto_url)")
        .range(from, to)
    ),
  ]);
  if (resultsError) throw resultsError;

  const winnerByMatch = goleadaWinnerByMatch(results ?? []);

  const winCounts = new Map<string, GoleadaStanding>();
  const loseCounts = new Map<string, GoleadaStanding>();

  for (const row of participants as {
    match_id: string;
    squadra: "bianca" | "nera";
    players: Pick<Player, "id" | "nome" | "cognome" | "foto_url">;
  }[]) {
    const winningSquadra = winnerByMatch.get(row.match_id);
    if (!winningSquadra) continue;
    const map = row.squadra === winningSquadra ? winCounts : loseCounts;
    const entry = map.get(row.players.id) ?? { player: row.players, count: 0 };
    entry.count += 1;
    map.set(row.players.id, entry);
  }

  return {
    totalGoleade: winnerByMatch.size,
    topWinners: Array.from(winCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    topLosers: Array.from(loseCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
  };
}

export interface RecordsPageData {
  groupTotals: GroupTotals;
  currentYearVsRecord: CurrentYearVsRecord;
  recordGoliPartita: { gol: number; entries: SingleMatchGoalEntry[] } | null;
  winStreak: PlayerHolderRecord | null;
  unbeatenStreak: PlayerHolderRecord | null;
  attendanceStreak: PlayerHolderRecord | null;
  decano: PlayerHolderRecord | null;
  fedele: (PlayerHolderRecord & { minPresenze: number }) | null;
  biggestTotalGoalsMatch: MatchRecord | null;
  biggestBlowout: MatchRecord | null;
  goleadaWinners: PlayerHolderRecord | null;
  goleadaLosers: PlayerHolderRecord | null;
  bestGoalMonth: MonthGoalsRecord | null;
  mostFrequentTeammates: PairRecord | null;
  mostFrequentOpponents: PairRecord | null;
}

export async function getRecordsPageData(): Promise<RecordsPageData> {
  const [matches, participants, matchResults, resultsById, yearTagged] = await Promise.all([
    getMatchesAsc(),
    getAllParticipantsWithPlayers(),
    getAllMatchResults(),
    getMatchResultsById(),
    getYearTaggedParticipants(),
  ]);

  const matchOrder = matches.map((m) => m.id);
  const matchIndexById = new Map(matchOrder.map((id, i) => [id, i]));
  const matchDateById = new Map(matches.map((m) => [m.id, m.data]));
  const winnerByMatch = goleadaWinnerByMatch(matchResults);
  const goleadaLeaders = computeGoleadaLeaders(participants, winnerByMatch);

  return {
    groupTotals: computeGroupTotals(matchOrder.length, matchResults),
    currentYearVsRecord: computeCurrentYearVsRecordYear(yearTagged, yearOf(new Date().toISOString())),
    recordGoliPartita: computeRecordGoliPartita(participants, matchDateById),
    winStreak: computeWinStreakRecord(participants, resultsById, matchIndexById),
    unbeatenStreak: computeUnbeatenStreakRecord(participants, resultsById, matchIndexById),
    attendanceStreak: computeAttendanceStreakRecord(matchOrder, participants),
    decano: computeDecano(participants),
    fedele: computeFedele(matchOrder, participants),
    biggestTotalGoalsMatch: computeBiggestTotalGoalsMatch(matchResults),
    biggestBlowout: computeBiggestBlowout(matchResults),
    goleadaWinners: goleadaLeaders.winners,
    goleadaLosers: goleadaLeaders.losers,
    bestGoalMonth: computeBestGoalMonth(matchResults),
    mostFrequentTeammates: computeMostFrequentPair(participants),
    mostFrequentOpponents: computeMostFrequentOpponents(participants),
  };
}

export type { PlayerLite };
