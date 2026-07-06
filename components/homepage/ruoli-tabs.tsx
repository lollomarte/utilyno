"use client";

import { useState } from "react";
import { Building2, Home as HomeIcon, KeyRound, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RuoloTab {
  id: string;
  label: string;
  titolo: string;
  testo: string;
}

/** Le icone vivono qui (componente client) e non nei dati passati dal Server
 * Component: un riferimento a componente non è serializzabile attraverso il
 * confine RSC server→client, un id stringa sì (stesso motivo di nav-icons.ts). */
const ROLE_ICONS: Record<string, LucideIcon> = {
  agenzia: Building2,
  proprietario: HomeIcon,
  inquilino: KeyRound,
  amministratore: Users,
};

/** Cross-fade tra i contenuti al cambio ruolo: il remount via key riusa
 * l'animazione di reveal già esistente, nessuna libreria di transizioni. */
export function RuoliTabs({ ruoli }: { ruoli: RuoloTab[] }) {
  const [activeId, setActiveId] = useState(ruoli[0].id);
  const active = ruoli.find((r) => r.id === activeId) ?? ruoli[0];
  const Icon = ROLE_ICONS[active.id] ?? Building2;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Scegli il tuo ruolo">
        {ruoli.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={r.id === activeId}
            onClick={() => setActiveId(r.id)}
            className={cn(
              "rounded-control px-4 py-2 text-sm font-medium transition-colors duration-[var(--duration-transition)] ease-[var(--ease-loqo)]",
              r.id === activeId
                ? "bg-primary text-white"
                : "bg-surface text-ink-muted ring-1 ring-inset ring-border hover:bg-surface-muted"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div key={active.id} className="animate-fade-in-up mt-8 rounded-card border border-border bg-surface p-8 shadow-card">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        </div>
        <h3 className="font-display mt-4 text-xl font-semibold text-ink">{active.titolo}</h3>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">{active.testo}</p>
      </div>
    </div>
  );
}
