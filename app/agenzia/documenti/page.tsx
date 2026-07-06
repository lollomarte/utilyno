import { requireAgenzia } from "@/lib/auth-helpers";
import { getImmobiliForAgenzia } from "@/lib/data/agenzia";
import { getDocumentiPerUtente } from "@/lib/data/documenti";
import { getPoolContestoDocumento } from "@/lib/documenti/risolviDestinatariDocumento";
import { DocumentiPageClient } from "@/components/documenti/documenti-page-client";
import type { ContestoOption } from "@/components/documenti/nuovo-documento-form";

export default async function AgenziaDocumentiPage() {
  const { session, agenzia } = await requireAgenzia();
  const [documenti, immobili] = await Promise.all([
    getDocumentiPerUtente(session.user.id),
    getImmobiliForAgenzia(agenzia.id),
  ]);

  const contesti: ContestoOption[] = await Promise.all(
    immobili.map(async (i) => ({
      tipo: "IMMOBILE" as const,
      id: i.id,
      label: `${i.indirizzo}, ${i.comune}`,
      pool: await getPoolContestoDocumento({ tipo: "IMMOBILE", id: i.id }, session.user.id),
    }))
  );

  return (
    <DocumentiPageClient
      title="Documenti"
      description="Documenti collegati al tuo portfolio immobili"
      documenti={documenti}
      contesti={contesti}
    />
  );
}
