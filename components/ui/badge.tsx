import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

/**
 * Il Badge è la prima, più piccola espressione de "Il Timbro" (l'elemento
 * firma di LOQO, vedi DESIGN_PLAN.md §4): un pallino pieno + un anello
 * interno a media saturazione danno una profondità "incisa/timbrata"
 * invece del pill piatto da SaaS generico — coerente col dominio
 * (contratti registrati, sigilli, atti). La versione "viva" (hover/press,
 * classe .timbro in globals.css) eleva lo stesso disegno alle superfici
 * davvero primarie della UI.
 */
const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-ink-muted ring-border",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)] ring-[var(--color-success)]/35",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] ring-[var(--color-warning)]/35",
  danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] ring-[var(--color-danger)]/35",
  info: "bg-[var(--color-info)]/10 text-[var(--color-info)] ring-[var(--color-info)]/35",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-ink-subtle",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]",
  info: "bg-[var(--color-info)]",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone]
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASSES[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}

const CONTRATTO_TONE: Record<string, BadgeTone> = {
  BOZZA: "neutral",
  ATTIVO: "success",
  SCADUTO: "warning",
  RISOLTO: "danger",
};

const DEPOSITO_TONE: Record<string, BadgeTone> = {
  NON_VERSATO: "neutral",
  VERSATO: "success",
  IN_CONTESTAZIONE: "danger",
  RESTITUITO: "info",
};

const PAGAMENTO_TONE: Record<string, BadgeTone> = {
  PROGRAMMATO: "info",
  PAGATO: "success",
  IN_RITARDO: "warning",
  INSOLUTO: "danger",
};

const UTENZA_TONE: Record<string, BadgeTone> = {
  DA_ATTIVARE: "warning",
  ATTIVA: "success",
  DISDETTA: "neutral",
};

const ASSICURAZIONE_TONE: Record<string, BadgeTone> = {
  ATTIVA: "success",
  SCADUTA: "danger",
  DA_RINNOVARE: "warning",
};

const SEGNALAZIONE_TONE: Record<string, BadgeTone> = {
  APERTA: "danger",
  IN_LAVORAZIONE: "warning",
  RISOLTA: "success",
};

const TICKET_TONE: Record<string, BadgeTone> = {
  APERTO: "danger",
  IN_LAVORAZIONE: "warning",
  RISOLTO: "success",
};

const IMMOBILE_TONE: Record<string, BadgeTone> = {
  BOZZA_PROPRIETARIO: "neutral",
  IN_GESTIONE_AGENZIA: "info",
  ATTIVO: "success",
};

const RICHIESTA_GESTIONE_TONE: Record<string, BadgeTone> = {
  IN_ATTESA: "warning",
  ACCETTATA: "success",
  RIFIUTATA: "danger",
};

export function StatoContrattoBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={CONTRATTO_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

export function StatoDepositoBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={DEPOSITO_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

export function StatoPagamentoBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={PAGAMENTO_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

export function StatoUtenzaBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={UTENZA_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

export function StatoAssicurazioneBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={ASSICURAZIONE_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

export function StatoSegnalazioneBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={SEGNALAZIONE_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

export function StatoTicketBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={TICKET_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

export function StatoImmobileBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={IMMOBILE_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

export function StatoRichiestaGestioneBadge({ stato, label }: { stato: string; label: string }) {
  return <Badge tone={RICHIESTA_GESTIONE_TONE[stato] ?? "neutral"}>{label}</Badge>;
}

const RELAZIONE_IMMOBILE_TONE: Record<string, BadgeTone> = {
  PROPRIETARIO: "info",
  INQUILINO: "success",
};

/** Ruolo dell'utente su un immobile specifico nella lista aggregata di /privato: un utente può
 * essere Proprietario di un immobile e Inquilino di un altro, il badge chiarisce quale. */
export function RelazioneImmobileBadge({ relazione }: { relazione: "PROPRIETARIO" | "INQUILINO" }) {
  return (
    <Badge tone={RELAZIONE_IMMOBILE_TONE[relazione]}>{relazione === "PROPRIETARIO" ? "Proprietario" : "Inquilino"}</Badge>
  );
}
