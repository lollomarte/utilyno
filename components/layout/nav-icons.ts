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
  "/admin/log": ScrollText,
  "/admin/privacy": ShieldCheck,
  "/agenzia": LayoutDashboard,
  "/agenzia/immobili": Building2,
  "/agenzia/contratti": FileText,
  "/agenzia/segnalazioni": MessageSquareWarning,
  "/amministratore": LayoutDashboard,
  "/amministratore/condomini": Building2,
  "/amministratore/segnalazioni": MessageSquareWarning,
  "/amministratore/comunicazioni": Megaphone,
  "/proprietario": LayoutDashboard,
  "/proprietario/immobili": Building2,
  "/proprietario/contratti": FileText,
  "/proprietario/pagamenti": Wallet,
  "/proprietario/segnalazioni": MessageSquareWarning,
  "/proprietario/documenti": FileStack,
  "/inquilino": LayoutDashboard,
  "/inquilino/contratto": FileText,
  "/inquilino/pagamenti": Wallet,
  "/inquilino/utenze": Zap,
  "/inquilino/segnalazioni": MessageSquareWarning,
  "/inquilino/checklist": ClipboardCheck,
};

export function getNavIcon(href: string): LucideIcon {
  if (href in NAV_ICONS) return NAV_ICONS[href];
  if (href.endsWith("/profilo")) return UserRound;
  return LayoutDashboard;
}
