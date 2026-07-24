import { getAllPlayers, getPlayer, getPlayerCareerStats, getPlayerMatchHistory, getPlayerMvpCount } from "@/lib/data/players";
import { getAttendanceStanding, getMatchesAsc, getTeamGoalsStanding } from "@/lib/data/stats";
import { computeMarketValues } from "@/lib/data/market";
import { computeContinuitaStats, computeRendimentoStats } from "@/lib/playerProfileStats";
import { getHeadToHead, type HeadToHead } from "@/lib/data/matches";
import type { Player } from "@/lib/types";

export interface PlayerComparisonStats {
  player: Player;
  golTotali: number;
  mediaGol: number;
  presenze: number;
  percentualePresenza: number;
  vittorie: number;
  pareggi: number;
  sconfitte: number;
  percentualeVittorie: number;
  mvpTotali: number;
  golFattiSquadra: number;
  golSubitiSquadra: number;
  differenzaReti: number;
  valoreMercato: number;
  strisciaVittorieRecord: number;
  strisciaPresenzeRecord: number;
}

export interface HeadToHeadPageData {
  allPlayers: Player[];
  playerA: PlayerComparisonStats | null;
  playerB: PlayerComparisonStats | null;
  h2h: HeadToHead | null;
}

export async function getHeadToHeadPageData(idA?: string, idB?: string): Promise<HeadToHeadPageData> {
  const [allPlayers, attendance, teamGoals, marketValues, allMatches] = await Promise.all([
    getAllPlayers(),
    getAttendanceStanding(),
    getTeamGoalsStanding(),
    computeMarketValues(),
    getMatchesAsc(),
  ]);

  const attendanceByPlayer = new Map(attendance.standing.map((r) => [r.player.id, r.percentuale]));
  const teamGoalsByPlayer = new Map(teamGoals.map((r) => [r.player_id, r]));
  const marketByPlayer = new Map(marketValues.map((r) => [r.player.id, r.valore]));

  async function buildStats(id?: string): Promise<PlayerComparisonStats | null> {
    if (!id) return null;
    const [player, careerStats, history, mvpTotali] = await Promise.all([
      getPlayer(id),
      getPlayerCareerStats(id),
      getPlayerMatchHistory(id),
      getPlayerMvpCount(id),
    ]);
    if (!player || !careerStats) return null;

    const rendimento = computeRendimentoStats(history, mvpTotali);
    const continuita = computeContinuitaStats(history, allMatches, attendance.totalMatches);
    const team = teamGoalsByPlayer.get(id);

    return {
      player,
      golTotali: careerStats.gol_totali,
      mediaGol: careerStats.media_gol,
      presenze: careerStats.presenze,
      percentualePresenza: attendanceByPlayer.get(id) ?? 0,
      vittorie: rendimento.vittorie,
      pareggi: rendimento.pareggi,
      sconfitte: rendimento.sconfitte,
      percentualeVittorie: rendimento.percentualeVittorie,
      mvpTotali,
      golFattiSquadra: team?.gol_fatti ?? 0,
      golSubitiSquadra: team?.gol_subiti ?? 0,
      differenzaReti: team?.differenza_reti ?? 0,
      valoreMercato: marketByPlayer.get(id) ?? 0,
      strisciaVittorieRecord: rendimento.strisciaVittorieRecord,
      strisciaPresenzeRecord: continuita.strisciaPresenzeRecord,
    };
  }

  const [playerA, playerB] = await Promise.all([buildStats(idA), buildStats(idB)]);
  const h2h = idA && idB && idA !== idB ? await getHeadToHead(idA, idB) : null;

  return { allPlayers, playerA, playerB, h2h };
}
