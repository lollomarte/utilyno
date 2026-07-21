import {
  LayoutDashboard,
  Building2,
  FileText,
  MessageSquareWarning,
  UserRound,
  Handshake,
  Users,
  PiggyBank,
  Megaphone,
  Wallet,
  FileStack,
  Zap,
  ClipboardCheck,
  ScrollText,
  ShieldCheck,
  Inbox,
  MessageSquareText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Le icone di navigazione vivono qui (importate solo da componenti client)
 * anziché essere passate come prop dai layout (Server Component): un
 * riferimento a componente non è serializzabile attraverso il confine
 * RSC server→client, un percorso stringa (href) sì.
 */
const NAV_ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/agenzie": Building2,
  "/admin/amministratori": Users,
  "/admin/contratti": FileText,
  "/admin/depositi": PiggyBank,
  "/admin/lead": Handshake,
  "/admin/documenti": FileStack,
  "/admin/log": ScrollText,
  "/admin/privacy": ShieldCheck,
  "/admin/note-sviluppatore": MessageSquareText,
  "/agenzia": LayoutDashboard,
  "/agenzia/immobili": Building2,
  "/agenzia/contratti": FileText,
  "/agenzia/segnalazioni": MessageSquareWarning,
  "/agenzia/richieste-gestione": Inbox,
  "/agenzia/documenti": FileStack,
  "/agenzia/note-sviluppatore": MessageSquareText,
  "/amministratore": LayoutDashboard,
  "/amministratore/condomini": Building2,
  "/amministratore/segnalazioni": MessageSquareWarning,
  "/amministratore/comunicazioni": Megaphone,
  "/amministratore/documenti": FileStack,
  "/amministratore/note-sviluppatore": MessageSquareText,
  "/privato": Building2,
};

/// Suffisso -> icona, per le sotto-pagine di /privato/[immobileId]/*: il prefisso dinamico
/// (l'id immobile) non può stare come chiave esatta nella mappa sopra, stessa ragione per cui
/// non c'era prima per /casa/[immobileId]/*.
const NAV_ICON_SUFFISSI: [string, LucideIcon][] = [
  ["/profilo", UserRound],
  ["/note-sviluppatore", MessageSquareText],
  ["/pagamenti", Wallet],
  ["/segnalazioni", MessageSquareWarning],
  ["/documenti", FileStack],
  ["/utenze", Zap],
  ["/checklist", ClipboardCheck],
];

export function getNavIcon(href: string): LucideIcon {
  if (href in NAV_ICONS) return NAV_ICONS[href];
  const suffisso = NAV_ICON_SUFFISSI.find(([s]) => href.endsWith(s));
  if (suffisso) return suffisso[1];
  return LayoutDashboard;
}
