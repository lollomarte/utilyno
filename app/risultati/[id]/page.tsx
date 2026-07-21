import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchFull } from "@/lib/data/matches";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CountUp } from "@/components/CountUp";
import { MatchConfettiTrigger } from "@/components/MatchConfettiTrigger";
import { formatDate, playerName } from "@/lib/format";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const full = await getMatchFull(id);
  if (!full) notFound();

  const { match, result, mvp, participants } = full;
  const bianca = participants.filter((p) => p.squadra === "bianca");
  const nera = participants.filter((p) => p.squadra === "nera");
  const diff = Math.abs(result.gol_bianca - result.gol_nera);

  return (
    <div className="flex flex-col gap-6">
      <MatchConfettiTrigger show={diff >= 5} />

      <div>
        <Link href="/risultati" className="text-sm text-muted hover:text-ink">
          ← Tutti i risultati
        </Link>
        <p className="text-sm text-muted mt-2 capitalize">{formatDate(match.data)}</p>
        {match.note && <p className="text-sm mt-1">{match.note}</p>}
      </div>

      <div className="rounded-3xl border border-line-strong bg-surface p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #ffffff 0%, transparent 48%, transparent 52%, #000000 100%)",
          }}
        />
        <div className="relative flex items-center justify-center gap-3 sm:gap-6">
          <span className="flex-1 text-right font-display text-xs sm:text-sm tracking-wide text-muted">
            BIANCA
          </span>
          <div className="font-display font-bold text-5xl sm:text-6xl tabular-nums flex items-center gap-2 sm:gap-3">
            <CountUp value={result.gol_bianca} duration={0.8} />
            <span className="text-muted text-3xl sm:text-4xl">–</span>
            <CountUp value={result.gol_nera} duration={0.8} />
          </div>
          <span className="flex-1 font-display text-xs sm:text-sm tracking-wide text-muted">NERA</span>
        </div>
        {diff >= 5 && (
          <p className="relative text-center text-xs font-semibold text-gold mt-3">🔥 Goleada!</p>
        )}
      </div>

      {mvp && (
        <Link
          href={`/giocatori/${mvp.id}`}
          className="tap flex items-center justify-center gap-2 text-sm rounded-full border border-line bg-surface px-4 py-2 mx-auto hover:border-line-strong"
        >
          <span className="text-gold">⭐</span>
          <span className="text-muted">MVP di giornata:</span>
          <PlayerAvatar player={mvp} size={24} />
          <span className="font-semibold">{playerName(mvp)}</span>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TeamList title="Bianca" accentClass="text-ink" players={bianca} />
        <TeamList title="Nera" accentClass="text-muted" players={nera} />
      </div>
    </div>
  );
}

function TeamList({
  title,
  accentClass,
  players,
}: {
  title: string;
  accentClass: string;
  players: {
    id: string;
    gol: number;
    player: { id: string; nome: string; cognome: string; foto_url: string | null };
  }[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <h2 className={`font-display font-semibold mb-3 ${accentClass}`}>{title}</h2>
      <ul className="flex flex-col gap-1">
        {players.map((p) => (
          <li key={p.id}>
            <Link
              href={`/giocatori/${p.player.id}`}
              className="tap flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2"
            >
              <PlayerAvatar player={p.player} size={28} />
              <span className="flex-1 text-sm truncate">{playerName(p.player)}</span>
              {p.gol > 0 && (
                <span className="text-xs tracking-tight shrink-0" title={`${p.gol} gol`}>
                  {"⚽".repeat(Math.min(p.gol, 5))}
                  {p.gol > 5 && <span className="text-muted"> +{p.gol - 5}</span>}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
