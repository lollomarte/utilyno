import { AlertTriangle, FileClock, ShieldCheck, MessageSquareWarning, Megaphone, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TipoNotifica } from "@/lib/notifiche/raccogliNotifiche";

/**
 * Icona e colore per tipo, per riconoscere ogni notifica a colpo d'occhio:
 * rosso per pagamenti in ritardo/insoluti, arancione per scadenze imminenti,
 * blu per segnalazioni/comunicazioni non lette.
 */
export const NOTIFICA_VISUAL: Record<TipoNotifica, { icon: LucideIcon; iconClass: string; badgeClass: string }> = {
  pagamento_in_ritardo: { icon: AlertTriangle, iconClass: "text-danger", badgeClass: "bg-danger" },
  pagamento_insoluto: { icon: AlertTriangle, iconClass: "text-danger", badgeClass: "bg-danger" },
  scadenza_contratto: { icon: FileClock, iconClass: "text-warning", badgeClass: "bg-warning" },
  scadenza_registrazione_ade: { icon: FileClock, iconClass: "text-warning", badgeClass: "bg-warning" },
  scadenza_assicurazione: { icon: ShieldCheck, iconClass: "text-warning", badgeClass: "bg-warning" },
  segnalazione_non_letta: { icon: MessageSquareWarning, iconClass: "text-info", badgeClass: "bg-info" },
  comunicazione_non_letta: { icon: Megaphone, iconClass: "text-info", badgeClass: "bg-info" },
  richiesta_gestione_ricevuta: { icon: Inbox, iconClass: "text-info", badgeClass: "bg-info" },
};
