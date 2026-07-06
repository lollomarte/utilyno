import { requireInquilino } from "@/lib/auth-helpers";
import { getContrattiForInquilino } from "@/lib/data/inquilino";
import { getDocumentiPerUtente } from "@/lib/data/documenti";
import { getPoolContestoDocumento } from "@/lib/documenti/risolviDestinatariDocumento";
import { DocumentiPageClient } from "@/components/documenti/documenti-page-client";
import type { ContestoOption } from "@/components/documenti/nuovo-documento-form";

export default async function InquilinoDocumentiPage() {
  const { session, inquilino } = await requireInquilino();
  const [documenti, contratti] = await Promise.all([
    getDocumentiPerUtente(session.user.id),
    getContrattiForInquilino(inquilino.id),
  ]);

  const contesti: ContestoOption[] = await Promise.all(
    contratti.map(async (c) => ({
      tipo: "CONTRATTO" as const,
      id: c.id,
      label: `${c.immobile.indirizzo}, ${c.immobile.comune}`,
      pool: await getPoolContestoDocumento({ tipo: "CONTRATTO", id: c.id }, session.user.id),
    }))
  );

  return (
    <DocumentiPageClient
      title="Documenti"
      description="Documenti collegati al tuo contratto"
      documenti={documenti}
      contesti={contesti}
    />
  );
}
