export type Squadra = "bianca" | "nera";
export type Esito = "vittoria" | "pareggio" | "sconfitta";

export interface Player {
  id: string;
  nome: string;
  cognome: string;
  data_nascita: string | null;
  foto_url: string | null;
  attivo: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  data: string;
  note: string | null;
  mvp_player_id: string | null;
  created_at: string;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  player_id: string;
  squadra: Squadra;
  gol: number;
}

export interface MatchResult {
  match_id: string;
  data: string;
  note: string | null;
  mvp_player_id: string | null;
  gol_bianca: number;
  gol_nera: number;
  num_partecipanti: number;
}

export interface PlayerCareerStats {
  player_id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
  attivo: boolean;
  presenze: number;
  gol_totali: number;
  media_gol: number;
  vittorie: number;
  pareggi: number;
  sconfitte: number;
  record_gol_partita: number;
}

export interface MvpStanding {
  player_id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
  mvp_count: number;
}

export interface PlayerMatchResult {
  id: string;
  match_id: string;
  player_id: string;
  squadra: Squadra;
  gol: number;
  data: string;
  gol_bianca: number;
  gol_nera: number;
  esito: Esito;
  note: string | null;
  num_partecipanti: number;
}
