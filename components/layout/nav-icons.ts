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
  "/proprietario": LayoutDashboard,
  "/proprietario/immobili": Building2,
  "/proprietario/contratti": FileText,
  "/proprietario/pagamenti": Wallet,
  "/proprietario/segnalazioni": MessageSquareWarning,
  "/proprietario/documenti": FileStack,
  "/proprietario/note-sviluppatore": MessageSquareText,
  "/inquilino": LayoutDashboard,
  "/inquilino/contratto": FileText,
  "/inquilino/pagamenti": Wallet,
  "/inquilino/utenze": Zap,
  "/inquilino/segnalazioni": MessageSquareWarning,
  "/inquilino/checklist": ClipboardCheck,
  "/inquilino/documenti": FileStack,
  "/inquilino/note-sviluppatore": MessageSquareText,
};

export function getNavIcon(href: string): LucideIcon {
  if (href in NAV_ICONS) return NAV_ICONS[href];
  if (href.endsWith("/profilo")) return UserRound;
  // Copre anche /casa/[immobileId]/note-sviluppatore, dove il prefisso dinamico non può stare nella mappa sopra.
  if (href.endsWith("/note-sviluppatore")) return MessageSquareText;
  return LayoutDashboard;
}
