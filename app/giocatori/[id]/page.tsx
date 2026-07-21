import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer, getPlayerCareerStats, getPlayerMatchHistory } from "@/lib/data/players";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { EmptyState } from "@/components/EmptyState";
import { age, formatDateShort, playerName } from "@/lib/format";
import type { Esito } from "@/lib/types";

const esitoLabel: Record<Esito, string> = {
  vittoria: "V",
  pareggio: "P",
  sconfitta: "S",
};

const esitoStyle: Record<Esito, string> = {
  vittoria: "bg-nera text-paper",
  pareggio: "bg-line text-ink",
  sconfitta: "border border-line text-muted",
};

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await getPlayer(id);
  if (!player) notFound();

  const [stats, history] = await Promise.all([
    getPlayerCareerStats(id),
    getPlayerMatchHistory(id, 5),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <PlayerAvatar player={player} size={72} />
        <div>
          <h1 className="text-xl font-bold">{playerName(player)}</h1>
          <p className="text-sm text-muted">
            {player.data_nascita ? `${age(player.data_nascita)} anni` : "Età non indicata"}
            {!player.attivo && " · non attivo"}
          </p>
        </div>
      </div>

      {stats && stats.presenze > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Presenze" value={stats.presenze} />
            <StatBox label="Gol totali" value={stats.gol_totali} />
            <StatBox label="Media gol" value={stats.media_gol} />
            <StatBox label="Vittorie" value={stats.vittorie} />
            <StatBox label="Pareggi" value={stats.pareggi} />
            <StatBox label="Sconfitte" value={stats.sconfitte} />
          </div>

          <div>
            <h2 className="font-semibold mb-2">Ultime 5 partite</h2>
            <ul className="flex flex-col gap-1.5">
              {history.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/risultati/${h.match_id}`}
                    className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 hover:border-ink"
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
                      <span className="text-sm font-semibold tabular-nums">{h.gol} gol</span>
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
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-line p-3 text-center">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
