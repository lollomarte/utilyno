import Link from "next/link";
import { getAllMatchResults } from "@/lib/data/matches";
import { EmptyState } from "@/components/EmptyState";
import { StaggerList, StaggerItem } from "@/components/StaggerList";
import { formatDateShort } from "@/lib/format";

function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function RisultatiPage() {
  const matches = await getAllMatchResults();

  const groups: { label: string; matches: typeof matches }[] = [];
  for (const m of matches) {
    const label = monthLabel(m.data);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.matches.push(m);
    } else {
      groups.push({ label, matches: [m] });
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Risultati</h1>
      {matches.length === 0 ? (
        <EmptyState>Nessuna partita registrata ancora.</EmptyState>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2 capitalize">
                {group.label}
              </p>
              <StaggerList className="flex flex-col gap-2 relative border-l border-line ml-2 pl-4">
                {group.matches.map((m) => {
                  const diff = Math.abs(m.gol_bianca - m.gol_nera);
                  return (
                    <StaggerItem key={m.match_id}>
                      <div className="relative">
                        <span className="absolute -left-[21px] top-4 w-2 h-2 rounded-full bg-accent" />
                        <Link
                          href={`/risultati/${m.match_id}`}
                          className="tap flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 hover:border-line-strong transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{formatDateShort(m.data)}</p>
                            {m.note && <p className="text-xs text-muted mt-0.5">{m.note}</p>}
                            {diff >= 5 && (
                              <span className="text-[10px] font-semibold text-gold mt-1 inline-block">
                                🔥 goleada
                              </span>
                            )}
                          </div>
                          <p className="font-display text-xl font-bold tabular-nums shrink-0">
                            {m.gol_bianca} – {m.gol_nera}
                          </p>
                        </Link>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerList>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
