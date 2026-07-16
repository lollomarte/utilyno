import { notFound } from "next/navigation";
import { requirePrivato } from "@/lib/auth-helpers";
import { getContestoImmobile } from "@/lib/immobili/getImmobiliUtente";
import { getContrattoPerImmobileInquilino } from "@/lib/data/inquilino";
import { getDocumentiPerUtente } from "@/lib/data/documenti";
import { getPoolContestoDocumento } from "@/lib/documenti/risolviDestinatariDocumento";
import { DocumentiPageClient } from "@/components/documenti/documenti-page-client";
import type { ContestoOption } from "@/components/documenti/nuovo-documento-form";

export default async function ImmobileDocumentiPage({ params }: { params: Promise<{ immobileId: string }> }) {
  const { immobileId } = await params;
  const { session } = await requirePrivato();
  const contesto = await getContestoImmobile(session.user.id, immobileId);
  if (!contesto) notFound();

  const documentiTutti = await getDocumentiPerUtente(session.user.id);
  // getDocumentiPerUtente aggrega su TUTTI i documenti dell'utente: qui vanno filtrati a questo
  // immobile, sia quelli collegati direttamente sia quelli collegati a un contratto su di esso.
  const documenti = documentiTutti.filter((d) => d.immobileId === immobileId || d.contratto?.immobileId === immobileId);

  if (contesto.relazione === "PROPRIETARIO") {
    const contesti: ContestoOption[] = [
      {
        tipo: "IMMOBILE",
        id: immobileId,
        label: "Questo immobile",
        pool: await getPoolContestoDocumento({ tipo: "IMMOBILE", id: immobileId }, session.user.id),
      },
    ];
    return (
      <DocumentiPageClient title="Documenti" description="Documenti collegati a questo immobile" documenti={documenti} contesti={contesti} />
    );
  }

  const contratto = await getContrattoPerImmobileInquilino(contesto.inquilinoId, immobileId);
  if (!contratto) notFound();

  const contesti: ContestoOption[] = [
    {
      tipo: "CONTRATTO",
      id: contratto.id,
      label: "Il tuo contratto",
      pool: await getPoolContestoDocumento({ tipo: "CONTRATTO", id: contratto.id }, session.user.id),
    },
  ];

  return (
    <DocumentiPageClient title="Documenti" description="Documenti collegati al tuo contratto" documenti={documenti} contesti={contesti} />
  );
}
