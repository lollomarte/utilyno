import { notFound } from "next/navigation";
import { requireAmministratore } from "@/lib/auth-helpers";
import { getSegnalazioneDetail } from "@/lib/data/segnalazioni";
import { SegnalazioneDetail } from "@/components/segnalazioni/segnalazione-detail";

export default async function SegnalazioneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, amministratore } = await requireAmministratore();
  const segnalazione = await getSegnalazioneDetail(id, session.user.id);
  if (!segnalazione) notFound();

  const puoModificareStato =
    segnalazione.creatoDaUserId === session.user.id || segnalazione.immobile.condominio?.amministratoreId === amministratore.id;

  return (
    <SegnalazioneDetail
      segnalazione={segnalazione}
      currentUserId={session.user.id}
      puoModificareStato={puoModificareStato}
      backHref="/amministratore/segnalazioni"
    />
  );
}
