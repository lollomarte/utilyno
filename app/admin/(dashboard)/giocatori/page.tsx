import { Suspense } from "react";
import Link from "next/link";
import { getAllPlayers } from "@/lib/data/players";
import { toggleActiveAction } from "@/lib/actions/players";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { EmptyState } from "@/components/EmptyState";
import { ToastOnQuery } from "@/components/ToastOnQuery";
import { playerName } from "@/lib/format";

export default async function AdminGiocatoriPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const players = await getAllPlayers({ search: q });

  return (
    <div>
      <Suspense fallback={null}>
        <ToastOnQuery />
      </Suspense>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="font-display text-xl font-bold">Giocatori</h1>
        <Link
          href="/admin/giocatori/nuovo"
          className="tap bg-accent text-[#06210f] rounded-full px-4 py-2 text-sm font-semibold"
        >
          + Nuovo
        </Link>
      </div>

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cerca per nome o cognome…"
          className="w-full border border-line bg-surface rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
      </form>

      {players.length === 0 ? (
        <EmptyState>Nessun giocatore trovato.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
            >
              <PlayerAvatar player={p} size={36} />
              <Link href={`/admin/giocatori/${p.id}`} className="flex-1 font-medium hover:underline">
                {playerName(p)}
              </Link>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  p.attivo ? "bg-accent-dim text-accent" : "border border-line text-muted"
                }`}
              >
                {p.attivo ? "Attivo" : "Non attivo"}
              </span>
              <form action={toggleActiveAction}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="attivo" value={String(p.attivo)} />
                <button type="submit" className="tap text-sm text-muted hover:text-ink">
                  {p.attivo ? "Disattiva" : "Attiva"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
