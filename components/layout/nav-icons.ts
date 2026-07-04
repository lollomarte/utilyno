import { LayoutDashboard, Building2, FileText, MessageSquareWarning, UserRound } from "lucide-react";
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
  "/agenzia": LayoutDashboard,
  "/agenzia/immobili": Building2,
  "/agenzia/contratti": FileText,
  "/amministratore": LayoutDashboard,
  "/amministratore/condomini": Building2,
  "/amministratore/segnalazioni": MessageSquareWarning,
  "/proprietario": LayoutDashboard,
  "/inquilino": LayoutDashboard,
  "/inquilino/ticket": MessageSquareWarning,
};

export function getNavIcon(href: string): LucideIcon {
  if (href in NAV_ICONS) return NAV_ICONS[href];
  if (href.endsWith("/profilo")) return UserRound;
  return LayoutDashboard;
}
