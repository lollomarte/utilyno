import { requireAmministratore } from "@/lib/auth-helpers";
import { getCondominiForAmministratore } from "@/lib/data/amministratore";
import { getDocumentiPerUtente } from "@/lib/data/documenti";
import { getPoolContestoDocumento } from "@/lib/documenti/risolviDestinatariDocumento";
import { DocumentiPageClient } from "@/components/documenti/documenti-page-client";
import type { ContestoOption } from "@/components/documenti/nuovo-documento-form";

export default async function AmministratoreDocumentiPage() {
  const { session, amministratore } = await requireAmministratore();
  const [documenti, condomini] = await Promise.all([
    getDocumentiPerUtente(session.user.id),
    getCondominiForAmministratore(amministratore.id),
  ]);

  const contesti: ContestoOption[] = await Promise.all(
    condomini.map(async (c) => ({
      tipo: "CONDOMINIO" as const,
      id: c.id,
      label: c.nome,
      pool: await getPoolContestoDocumento({ tipo: "CONDOMINIO", id: c.id }, session.user.id),
    }))
  );

  return (
    <DocumentiPageClient
      title="Documenti"
      description="Documenti collegati ai condomini che gestisci"
      documenti={documenti}
      contesti={contesti}
    />
  );
}
