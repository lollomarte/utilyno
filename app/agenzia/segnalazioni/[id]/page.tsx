import { notFound } from "next/navigation";
import { requireAgenzia } from "@/lib/auth-helpers";
import { getSegnalazioneDetail } from "@/lib/data/segnalazioni";
import { SegnalazioneDetail } from "@/components/segnalazioni/segnalazione-detail";

export default async function SegnalazioneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session } = await requireAgenzia();
  const segnalazione = await getSegnalazioneDetail(id, session.user.id);
  if (!segnalazione) notFound();

  return (
    <SegnalazioneDetail
      segnalazione={segnalazione}
      currentUserId={session.user.id}
      puoModificareStato={segnalazione.creatoDaUserId === session.user.id}
      backHref="/agenzia/segnalazioni"
    />
  );
}
