import { redirect } from "next/navigation";
import { requirePrivato } from "@/lib/auth-helpers";
import { getContestoImmobile, getImmobiliUtente } from "@/lib/immobili/getImmobiliUtente";
import { PortalShell } from "@/components/layout/portal-shell";
import type { NavItem } from "@/components/layout/sidebar";

function navItemsPerRuolo(base: string, ruolo: "PROPRIETARIO" | "INQUILINO"): NavItem[] {
  if (ruolo === "PROPRIETARIO") {
    return [
      { href: base, label: "Dashboard" },
      { href: `${base}/pagamenti`, label: "Pagamenti e Depositi" },
      { href: `${base}/segnalazioni`, label: "Segnalazioni" },
      { href: `${base}/documenti`, label: "Documenti" },
      { href: `${base}/note-sviluppatore`, label: "Note per lo sviluppatore" },
    ];
  }
  return [
    { href: base, label: "Dashboard" },
    { href: `${base}/pagamenti`, label: "Pagamenti" },
    { href: `${base}/utenze`, label: "Utenze" },
    { href: `${base}/segnalazioni`, label: "Segnalazioni" },
    { href: `${base}/checklist`, label: "Checklist" },
    { href: `${base}/documenti`, label: "Documenti" },
    { href: `${base}/note-sviluppatore`, label: "Note per lo sviluppatore" },
  ];
}

export default async function ImmobileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ immobileId: string }>;
}) {
  const { immobileId } = await params;
  const { session } = await requirePrivato();

  const [contesto, immobili] = await Promise.all([
    getContestoImmobile(session.user.id, immobileId),
    getImmobiliUtente(session.user.id),
  ]);
  if (!contesto) redirect("/non-autorizzato");

  const immobile = immobili.find((i) => i.id === immobileId);
  const base = `/privato/${immobileId}`;

  // Lo switcher in header mostra TUTTI gli immobili dell'utente (non i portali): selezionandone
  // uno diverso l'intera interfaccia si adatta al ruolo della relazione con quel nuovo immobile.
  const switcherVoci =
    immobili.length > 1
      ? immobili.map((i) => ({
          href: `/privato/${i.id}`,
          label: `${i.indirizzo}, ${i.comune} · ${i.relazione === "PROPRIETARIO" ? "Proprietario" : "Inquilino"}`,
        }))
      : [];

  return (
    <PortalShell
      portalLabel={immobile ? `${immobile.indirizzo}, ${immobile.comune}` : "I miei immobili"}
      roleLabel={contesto.relazione === "PROPRIETARIO" ? "Proprietario" : "Inquilino"}
      navItems={navItemsPerRuolo(base, contesto.relazione)}
      nome={session.user.nome}
      cognome={session.user.cognome}
      userId={session.user.id}
      switcherVoci={switcherVoci}
    >
      {children}
    </PortalShell>
  );
}
