"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { segnaComunicazioneLettaAction } from "@/app/actions/comunicazioni";
import { NOTIFICA_VISUAL } from "@/components/notifiche/notifica-visual";
import type { Notifica } from "@/lib/notifiche/raccogliNotifiche";
import { cn, formatDate, withTimeout } from "@/lib/utils";

export function NotificationBell({ notifiche }: { notifiche: Notifica[] }) {
  const [open, setOpen] = useState(false);
  const count = notifiche.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={count > 0 ? `Notifiche: ${count} da controllare` : "Notifiche"}
        className="touch-target relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-surface-sunken hover:text-ink"
      >
        <Bell className={cn("h-5 w-5", count > 0 && "animate-bell-ring")} strokeWidth={2} aria-hidden="true" />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-sheet bg-surface shadow-sheet",
              "md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-full md:mt-2 md:max-h-[28rem] md:w-96 md:rounded-card md:shadow-elevated"
            )}
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-1 mt-3 h-1.5 w-10 shrink-0 rounded-full bg-slate-200 md:hidden" aria-hidden="true" />
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="font-display text-base font-semibold text-ink">Notifiche</h2>
              {count > 0 && <span className="text-xs text-slate-400">{count} da controllare</span>}
            </div>
            {count === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Nessuna notifica al momento.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifiche.map((n) => (
                  <NotificaRow key={n.id} notifica={n} onNavigate={() => setOpen(false)} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NotificaRow({ notifica, onNavigate }: { notifica: Notifica; onNavigate: () => void }) {
  const router = useRouter();
  const { icon: Icon, iconClass } = NOTIFICA_VISUAL[notifica.tipo];

  const content = (
    <>
      <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken", iconClass)}>
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{notifica.titolo}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">{notifica.descrizione}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{formatDate(notifica.data)}</span>
      </span>
    </>
  );

  // Le comunicazioni non hanno una pagina di dettaglio da visitare: il click deve
  // segnarle come lette esplicitamente prima di navigare, non solo aprire il link.
  if (notifica.tipo === "comunicazione_non_letta" && notifica.entitaId) {
    async function handleClick() {
      onNavigate();
      try {
        await withTimeout(segnaComunicazioneLettaAction(notifica.entitaId!));
      } catch {
        // Silenzioso: la comunicazione resta comunque raggiungibile e rimarrà "non letta" al prossimo giro.
      }
      router.push(notifica.href);
      router.refresh();
    }

    return (
      <li>
        <button type="button" onClick={handleClick} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-muted">
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link href={notifica.href} onClick={onNavigate} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-muted">
        {content}
      </Link>
    </li>
  );
}
