import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPlayers,
  getPlayer,
  getPlayerCareerStats,
  getPlayerMatchHistory,
  getPlayerMvpCount,
} from "@/lib/data/players";
import { getPlayerBadges } from "@/lib/data/badges";
import { getHeadToHead } from "@/lib/data/matches";
import { getAttendanceStanding, getMatchesAsc, getScorersStanding, getWinsStanding } from "@/lib/data/stats";
import { computeAttackStats, computeContinuitaStats, computeRendimentoStats, findRank } from "@/lib/playerProfileStats";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CountUp } from "@/components/CountUp";
import { Sparkline } from "@/components/Sparkline";
import { PlayerBadgeList } from "@/components/PlayerBadges";
import { PlayerStatsTabs } from "@/components/PlayerStatsTabs";
import { HeadToHeadWidget } from "@/components/HeadToHeadWidget";
import { EmptyState } from "@/components/EmptyState";
import { age, formatDateShort, playerName, ruoloLabel } from "@/lib/format";
import type { Esito } from "@/lib/types";

const esitoLabel: Record<Esito, string> = {
  vittoria: "V",
  pareggio: "P",
  sconfitta: "S",
};

const esitoStyle: Record<Esito, string> = {
  vittoria: "bg-accent text-[#06210f]",
  pareggio: "bg-surface-2 text-ink border border-line-strong",
  sconfitta: "border border-line text-muted",
};

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ vs?: string }>;
}) {
  const { id } = await params;
  const { vs } = await searchParams;
  const player = await getPlayer(id);
  if (!player) notFound();

  const [stats, fullHistory, allPlayers, vsPlayer, mvpTotali, scorers, attendance, wins, allMatches] =
    await Promise.all([
      getPlayerCareerStats(id),
      getPlayerMatchHistory(id),
      getAllPlayers(),
      vs && vs !== id ? getPlayer(vs) : Promise.resolve(null),
      getPlayerMvpCount(id),
      getScorersStanding(),
      getAttendanceStanding(),
      getWinsStanding(),
      getMatchesAsc(),
    ]);

  const h2h = vsPlayer ? await getHeadToHead(id, vsPlayer.id) : null;

  const badges = await getPlayerBadges(player, fullHistory);
  const last5 = fullHistory.slice(0, 5);
  const sparklineValues = fullHistory.slice(0, 10).reverse().map((h) => h.gol);
  const otherPlayers = allPlayers.filter((p) => p.id !== id);

  const rankMarcatori = findRank(
    scorers.filter((p) => p.presenze > 0),
    (p) => p.player_id === id
  );
  const rankPresenze = findRank(attendance.standing, (p) => p.player.id === id);
  const rankVittorie = findRank(
    wins.filter((p) => p.presenze > 0),
    (p) => p.player_id === id
  );

  const attacco = computeAttackStats(fullHistory);
  const squadra = computeRendimentoStats(fullHistory, mvpTotali);
  const continuita = computeContinuitaStats(fullHistory, allMatches, attendance.totalMatches);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-line-strong bg-surface p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.10),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col items-center text-center gap-3">
          <PlayerAvatar player={player} size={92} />
          <div>
            <h1 className="font-display text-2xl font-bold">{playerName(player)}</h1>
            <p className="text-sm text-muted">
              {player.data_nascita ? `${age(player.data_nascita)} anni` : "Età non indicata"}
              {player.ruolo && ` · ${ruoloLabel[player.ruolo]}`}
              {!player.attivo && " · non attivo"}
            </p>
          </div>
          <PlayerBadgeList badges={badges} />

          {(rankMarcatori || rankPresenze || rankVittorie) && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {rankMarcatori && <RankChip label="Marcatori" rank={rankMarcatori} href="/classifiche/marcatori" />}
              {rankPresenze && <RankChip label="Presenze" rank={rankPresenze} href="/classifiche/presenze" />}
              {rankVittorie && <RankChip label="Vittorie" rank={rankVittorie} href="/classifiche/vittorie" />}
            </div>
          )}

          {stats && stats.presenze > 0 && (
            <div className="grid grid-cols-3 gap-4 w-full mt-3 pt-4 border-t border-line">
              <BigStat label="Gol" value={stats.gol_totali} />
              <BigStat label="Presenze" value={stats.presenze} />
              <BigStat label="Media" value={stats.media_gol} decimals={2} />
            </div>
          )}
        </div>
      </div>

      {stats && stats.presenze > 0 ? (
        <>
          {sparklineValues.length >= 2 && (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                Gol nelle ultime {sparklineValues.length} partite
              </p>
              <Sparkline values={sparklineValues} />
            </div>
          )}

          <PlayerStatsTabs attacco={attacco} squadra={squadra} continuita={continuita} />

          <div>
            <h2 className="font-display font-semibold mb-2">Ultime 5 partite</h2>
            <ul className="flex flex-col gap-1.5">
              {last5.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/risultati/${h.match_id}`}
                    className="tap flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 hover:border-line-strong"
                  >
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${esitoStyle[h.esito]}`}
                    >
                      {esitoLabel[h.esito]}
                    </span>
                    <span className="flex-1 text-sm">{formatDateShort(h.data)}</span>
                    <span className="text-sm tabular-nums text-muted">
                      {h.gol_bianca} – {h.gol_nera}
                    </span>
                    {h.gol > 0 && (
                      <span className="text-sm font-semibold tabular-nums font-display">{h.gol} gol</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <EmptyState>Nessuna partita disputata ancora.</EmptyState>
      )}

      {otherPlayers.length > 0 && (
        <HeadToHeadWidget player={player} players={otherPlayers} vsPlayer={vsPlayer} h2h={h2h} />
      )}
    </div>
  );
}

function BigStat({ label, value, decimals = 0 }: { label: string; value: number; decimals?: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-4xl sm:text-5xl font-bold text-accent tabular-nums leading-none">
        <CountUp value={value} decimals={decimals} />
      </span>
      <span className="text-[11px] uppercase tracking-widest text-muted mt-1">{label}</span>
    </div>
  );
}

function RankChip({ label, rank, href }: { label: string; rank: number; href: string }) {
  return (
    <Link
      href={href}
      className="tap inline-flex items-center gap-1.5 text-xs rounded-full border border-line bg-surface-2 px-3 py-1 hover:border-line-strong"
    >
      <span className="font-display font-bold text-accent">{rank}°</span>
      <span className="text-muted">{label}</span>
    </Link>
  );
}
