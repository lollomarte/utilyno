// Calcolo puro per "Confronta formazione": nessuna query qui dentro, solo
// aggregazione a partire dalle statistiche per giocatore già recuperate dal
// server (vedi lib/data/formationComparison.ts). Vive fuori da lib/data
// perché viene importato anche dal componente client di selezione slot.
import type { Player, Ruolo } from "@/lib/types";

export interface FormationPlayerStats {
  player: Player;
  valoreMercato: number;
  golFattiSquadra: number;
  golSubitiSquadra: number;
  presenze: number;
  percentualeVittorie: number;
}

export interface FormationTeamAggregate {
  count: number;
  players: FormationPlayerStats[];
  valoreMercatoTotale: number;
  golFattiTotale: number;
  golSubitiTotale: number;
  differenzaReti: number;
  mediaPresenze: number;
  mediaPercentualeVittorie: number;
  ruoli: Record<Ruolo, number>;
  senzaRuolo: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Slot vuoti (id "") e id senza statistiche vengono ignorati nel calcolo. */
export function aggregateTeam(
  ids: string[],
  statsByPlayer: Map<string, FormationPlayerStats>
): FormationTeamAggregate {
  const players = ids
    .filter(Boolean)
    .map((id) => statsByPlayer.get(id))
    .filter((s): s is FormationPlayerStats => Boolean(s));

  const count = players.length;
  const sum = (f: (p: FormationPlayerStats) => number) => players.reduce((s, p) => s + f(p), 0);

  const ruoli: Record<Ruolo, number> = { difensore: 0, centrocampista: 0, attaccante: 0 };
  let senzaRuolo = 0;
  for (const p of players) {
    if (p.player.ruolo) ruoli[p.player.ruolo]++;
    else senzaRuolo++;
  }

  const golFattiTotale = sum((p) => p.golFattiSquadra);
  const golSubitiTotale = sum((p) => p.golSubitiSquadra);

  return {
    count,
    players,
    valoreMercatoTotale: round1(sum((p) => p.valoreMercato)),
    golFattiTotale,
    golSubitiTotale,
    differenzaReti: golFattiTotale - golSubitiTotale,
    mediaPresenze: count > 0 ? round1(sum((p) => p.presenze) / count) : 0,
    mediaPercentualeVittorie: count > 0 ? round1(sum((p) => p.percentualeVittorie) / count) : 0,
    ruoli,
    senzaRuolo,
  };
}
