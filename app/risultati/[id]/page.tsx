import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchFull } from "@/lib/data/matches";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { formatDate, playerName } from "@/lib/format";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const full = await getMatchFull(id);
  if (!full) notFound();

  const { match, result, mvp, participants } = full;
  const bianca = participants.filter((p) => p.squadra === "bianca");
  const nera = participants.filter((p) => p.squadra === "nera");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/risultati" className="text-sm text-muted hover:text-ink">
          ← Tutti i risultati
        </Link>
        <p className="text-sm text-muted mt-2 capitalize">{formatDate(match.data)}</p>
        {match.note && <p className="text-sm mt-1">{match.note}</p>}
      </div>

      <div className="flex items-center justify-center gap-4 text-3xl font-bold">
        <span className="flex-1 text-right">Bianca</span>
        <span className="tabular-nums">
          {result.gol_bianca} – {result.gol_nera}
        </span>
        <span className="flex-1">Nera</span>
      </div>

      {mvp && (
        <Link
          href={`/giocatori/${mvp.id}`}
          className="flex items-center justify-center gap-2 text-sm rounded-full border border-line px-4 py-2 mx-auto hover:border-ink"
        >
          <span className="text-muted">MVP di giornata:</span>
          <PlayerAvatar player={mvp} size={24} />
          <span className="font-semibold">{playerName(mvp)}</span>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TeamList title="Bianca" players={bianca} />
        <TeamList title="Nera" players={nera} />
      </div>
    </div>
  );
}

function TeamList({
  title,
  players,
}: {
  title: string;
  players: { id: string; gol: number; player: { id: string; nome: string; cognome: string; foto_url: string | null } }[];
}) {
  return (
    <div>
      <h2 className="font-semibold mb-2">{title}</h2>
      <ul className="flex flex-col gap-1.5">
        {players.map((p) => (
          <li key={p.id}>
            <Link
              href={`/giocatori/${p.player.id}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-line/50"
            >
              <PlayerAvatar player={p.player} size={28} />
              <span className="flex-1 text-sm">{playerName(p.player)}</span>
              {p.gol > 0 && <span className="text-sm font-semibold tabular-nums">{p.gol}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
