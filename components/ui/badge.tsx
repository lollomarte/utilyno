import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone]
      )}
    >
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
