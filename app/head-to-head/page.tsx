import Link from "next/link";
import { getHeadToHeadPageData, type PlayerComparisonStats } from "@/lib/data/headToHead";
import type { HeadToHead } from "@/lib/data/matches";
import { PlayerVsPicker } from "@/components/PlayerVsPicker";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { ComparisonRow, compareValues, type StatComparison } from "@/components/ComparisonRow";
import { EmptyState } from "@/components/EmptyState";
import { formatDecimal, formatMarketValue, playerName } from "@/lib/format";
import type { Player } from "@/lib/types";

export default async function HeadToHeadPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const { allPlayers, playerA, playerB, h2h } = await getHeadToHeadPageData(a, b);

  if (allPlayers.length < 2) {
    return <EmptyState>Servono almeno due giocatori registrati per un confronto.</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Head to Head</h1>
        <p className="text-sm text-muted">Scegli due giocatori e scopri chi vince il confronto.</p>
      </div>

      <PlayerVsPicker players={allPlayers} idA={a} idB={b} />

      {a && b && a === b && <EmptyState>Scegli due giocatori diversi da confrontare.</EmptyState>}

      {playerA && playerB && h2h && <ComparisonContent playerA={playerA} playerB={playerB} h2h={h2h} />}

      {a && b && a !== b && (!playerA || !playerB) && (
        <EmptyState>
          Uno dei due giocatori selezionati non ha ancora statistiche sufficienti per il confronto.
        </EmptyState>
      )}
    </div>
  );
}

function ComparisonContent({
  playerA,
  playerB,
  h2h,
}: {
  playerA: PlayerComparisonStats;
  playerB: PlayerComparisonStats;
  h2h: HeadToHead;
}) {
  const sections: { title: string; stats: StatComparison[] }[] = [
    {
      title: "Gol",
      stats: [
        { label: "Gol totali", valueA: playerA.golTotali, valueB: playerB.golTotali },
        {
          label: "Media gol/partita",
          valueA: playerA.mediaGol,
          valueB: playerB.mediaGol,
          format: (v) => formatDecimal(v, 2),
        },
      ],
    },
    {
      title: "Presenze",
      stats: [
        { label: "Presenze", valueA: playerA.presenze, valueB: playerB.presenze },
        {
          label: "% presenza",
          valueA: playerA.percentualePresenza,
          valueB: playerB.percentualePresenza,
          format: (v) => `${formatDecimal(v, 1)}%`,
        },
      ],
    },
    {
      title: "Rendimento",
      stats: [
        { label: "Vittorie", valueA: playerA.vittorie, valueB: playerB.vittorie },
        { label: "Pareggi", valueA: playerA.pareggi, valueB: playerB.pareggi, neutral: true },
        { label: "Sconfitte", valueA: playerA.sconfitte, valueB: playerB.sconfitte, higherIsBetter: false },
        {
          label: "% vittorie",
          valueA: playerA.percentualeVittorie,
          valueB: playerB.percentualeVittorie,
          format: (v) => `${formatDecimal(v, 1)}%`,
        },
      ],
    },
    {
      title: "MVP",
      stats: [{ label: "MVP totali", valueA: playerA.mvpTotali, valueB: playerB.mvpTotali }],
    },
    {
      title: "Squadra",
      stats: [
        { label: "Gol fatti (squadra)", valueA: playerA.golFattiSquadra, valueB: playerB.golFattiSquadra },
        {
          label: "Gol subiti (squadra)",
          valueA: playerA.golSubitiSquadra,
          valueB: playerB.golSubitiSquadra,
          higherIsBetter: false,
        },
        { label: "Differenza reti", valueA: playerA.differenzaReti, valueB: playerB.differenzaReti },
      ],
    },
    {
      title: "Mercato",
      stats: [
        {
          label: "Valore di mercato",
          valueA: playerA.valoreMercato,
          valueB: playerB.valoreMercato,
          format: formatMarketValue,
        },
      ],
    },
    {
      title: "Strisce",
      stats: [
        {
          label: "Vittorie consecutive (record)",
          valueA: playerA.strisciaVittorieRecord,
          valueB: playerB.strisciaVittorieRecord,
        },
        {
          label: "Presenze consecutive (record)",
          valueA: playerA.strisciaPresenzeRecord,
          valueB: playerB.strisciaPresenzeRecord,
        },
      ],
    },
  ];

  let scoreA = 0;
  let scoreB = 0;
  for (const section of sections) {
    for (const stat of section.stats) {
      const winner = compareValues(stat);
      if (winner === "a") scoreA++;
      if (winner === "b") scoreB++;
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <PlayerHeader player={playerA.player} />
          <PlayerHeader player={playerB.player} align="right" />
        </div>
        <div className="flex flex-col">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs uppercase tracking-widest text-muted font-semibold pt-3 pb-1 first:pt-0">
                {section.title}
              </p>
              {section.stats.map((stat) => (
                <ComparisonRow key={stat.label} stat={stat} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">Scontri diretti</p>
        <div className="flex items-center justify-around text-center gap-3 mb-3">
          <MiniStat label="Volte insieme" value={h2h.together} />
          <MiniStat label="Volte avversari" value={h2h.against} />
        </div>
        {h2h.against > 0 && (
          <p className="text-center text-sm">
            <span className="font-display font-bold text-accent">{h2h.headToHead.winsA}</span>{" "}
            <span className="text-muted">vittorie {playerName(playerA.player)}</span>
            {" – "}
            <span className="font-display font-bold text-accent">{h2h.headToHead.winsB}</span>{" "}
            <span className="text-muted">vittorie {playerName(playerB.player)}</span>
            {h2h.headToHead.draws > 0 && <span className="text-muted">, {h2h.headToHead.draws} pareggi</span>}
          </p>
        )}
        {h2h.totalMatches === 0 && (
          <p className="text-center text-sm text-muted">
            {playerName(playerA.player)} e {playerName(playerB.player)} non hanno mai giocato nella stessa
            serata.
          </p>
        )}
      </div>

      <Verdict playerA={playerA.player} playerB={playerB.player} scoreA={scoreA} scoreB={scoreB} />
    </div>
  );
}

function PlayerHeader({ player, align = "left" }: { player: Player; align?: "left" | "right" }) {
  return (
    <Link
      href={`/giocatori/${player.id}`}
      className={`tap flex items-center gap-2 min-w-0 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <PlayerAvatar player={player} size={40} />
      <span className="font-semibold text-sm truncate">{playerName(player)}</span>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Verdict({
  playerA,
  playerB,
  scoreA,
  scoreB,
}: {
  playerA: Player;
  playerB: Player;
  scoreA: number;
  scoreB: number;
}) {
  const winner = scoreA === scoreB ? null : scoreA > scoreB ? playerA : playerB;
  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-5 text-center">
      <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">Verdetto</p>
      {winner ? (
        <p className="font-display text-xl font-bold">
          {Math.max(scoreA, scoreB)} – {Math.min(scoreA, scoreB)}: domina{" "}
          <span className="text-accent">{playerName(winner)}</span> 👑
        </p>
      ) : (
        <p className="font-display text-xl font-bold">
          {scoreA} – {scoreB}: equilibrio perfetto, nessuno domina 🤝
        </p>
      )}
    </div>
  );
}
