// Ricalcolo puro (nessuna dipendenza server) delle classifiche per un singolo
// anno, a partire dalle partecipazioni alle partite già annotate con l'anno.
// Vive separato da lib/data/stats.ts perché viene importato anche dai
// componenti client delle classifiche (quel modulo usa next/headers).
import type { Player, Ruolo } from "@/lib/types";

export interface YearTaggedParticipant {
  player: Player;
  year: string;
  gol: number;
  won: boolean;
}

export interface ScorerDisplayRow {
  player_id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
  attivo: boolean;
  ruolo: Ruolo | null;
  presenze: number;
  gol_totali: number;
  media_gol: number;
  rankDelta: number | null;
  isNew: boolean;
}

export function computeScorersByYear(rows: YearTaggedParticipant[], year: string): ScorerDisplayRow[] {
  const byPlayer = new Map<string, { player: Player; gol: number; presenze: number }>();
  for (const row of rows) {
    if (row.year !== year) continue;
    const entry = byPlayer.get(row.player.id) ?? { player: row.player, gol: 0, presenze: 0 };
    entry.gol += row.gol;
    entry.presenze += 1;
    byPlayer.set(row.player.id, entry);
  }
  return Array.from(byPlayer.values())
    .map(({ player, gol, presenze }) => ({
      player_id: player.id,
      nome: player.nome,
      cognome: player.cognome,
      foto_url: player.foto_url,
      attivo: player.attivo,
      ruolo: player.ruolo,
      presenze,
      gol_totali: gol,
      media_gol: presenze > 0 ? Math.round((gol / presenze) * 100) / 100 : 0,
      rankDelta: null,
      isNew: false,
    }))
    .sort((a, b) => b.gol_totali - a.gol_totali);
}

export interface WinsDisplayRow {
  player_id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
  attivo: boolean;
  ruolo: Ruolo | null;
  presenze: number;
  vittorie: number;
  media_vittorie: number;
  rankDelta: number | null;
  isNew: boolean;
}

export function computeWinsByYear(rows: YearTaggedParticipant[], year: string): WinsDisplayRow[] {
  const byPlayer = new Map<string, { player: Player; presenze: number; vittorie: number }>();
  for (const row of rows) {
    if (row.year !== year) continue;
    const entry = byPlayer.get(row.player.id) ?? { player: row.player, presenze: 0, vittorie: 0 };
    entry.presenze += 1;
    if (row.won) entry.vittorie += 1;
    byPlayer.set(row.player.id, entry);
  }
  return Array.from(byPlayer.values())
    .map(({ player, presenze, vittorie }) => ({
      player_id: player.id,
      nome: player.nome,
      cognome: player.cognome,
      foto_url: player.foto_url,
      attivo: player.attivo,
      ruolo: player.ruolo,
      presenze,
      vittorie,
      media_vittorie: presenze > 0 ? Math.round((vittorie / presenze) * 100) / 100 : 0,
      rankDelta: null,
      isNew: false,
    }))
    .sort((a, b) => b.vittorie - a.vittorie);
}

export interface AttendanceDisplayRow {
  player: Player;
  presenze: number;
  percentuale: number;
  rankDelta: number | null;
  isNew: boolean;
}

export function computeAttendanceByYear(
  rows: YearTaggedParticipant[],
  year: string,
  totalMatches: number
): AttendanceDisplayRow[] {
  const byPlayer = new Map<string, { player: Player; presenze: number }>();
  for (const row of rows) {
    if (row.year !== year) continue;
    const entry = byPlayer.get(row.player.id) ?? { player: row.player, presenze: 0 };
    entry.presenze += 1;
    byPlayer.set(row.player.id, entry);
  }
  return Array.from(byPlayer.values())
    .map(({ player, presenze }) => ({
      player,
      presenze,
      percentuale: totalMatches > 0 ? Math.round((presenze / totalMatches) * 1000) / 10 : 0,
      rankDelta: null,
      isNew: false,
    }))
    .sort((a, b) => b.presenze - a.presenze);
}
