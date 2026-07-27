import { getAllPlayers } from "@/lib/data/players";
import { getAttendanceStanding, getTeamGoalsStanding, getWinsStanding } from "@/lib/data/stats";
import { computeMarketValues } from "@/lib/data/market";
import type { FormationPlayerStats } from "@/lib/formationComparison";
import type { Player } from "@/lib/types";

export interface FormationComparisonData {
  allPlayers: Player[];
  playerStats: FormationPlayerStats[];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Statistiche per giocatore usate da "Confronta formazione": nessuna query
 * nuova, riusa le stesse fonti già calcolate per mercato, gol squadra,
 * presenze e vittorie (vedi getHeadToHeadPageData per lo stesso pattern a
 * livello di singolo giocatore).
 */
export async function getFormationComparisonData(): Promise<FormationComparisonData> {
  const [allPlayers, attendance, teamGoals, marketValues, wins] = await Promise.all([
    getAllPlayers(),
    getAttendanceStanding(),
    getTeamGoalsStanding(),
    computeMarketValues(),
    getWinsStanding(),
  ]);

  const attendanceByPlayer = new Map(attendance.standing.map((r) => [r.player.id, r.presenze]));
  const teamGoalsByPlayer = new Map(teamGoals.map((r) => [r.player_id, r]));
  const marketByPlayer = new Map(marketValues.map((r) => [r.player.id, r.valore]));
  const winsByPlayer = new Map(wins.map((r) => [r.player_id, r]));

  const playerStats: FormationPlayerStats[] = allPlayers.map((player) => {
    const team = teamGoalsByPlayer.get(player.id);
    const winRow = winsByPlayer.get(player.id);
    const percentualeVittorie =
      winRow && winRow.presenze > 0 ? round1((winRow.vittorie / winRow.presenze) * 100) : 0;

    return {
      player,
      valoreMercato: marketByPlayer.get(player.id) ?? 0,
      golFattiSquadra: team?.gol_fatti ?? 0,
      golSubitiSquadra: team?.gol_subiti ?? 0,
      presenze: attendanceByPlayer.get(player.id) ?? 0,
      percentualeVittorie,
    };
  });

  return { allPlayers, playerStats };
}
