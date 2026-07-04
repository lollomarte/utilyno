import { notFound } from "next/navigation";
import { requireInquilino } from "@/lib/auth-helpers";
import { getSegnalazioneDetail } from "@/lib/data/segnalazioni";
import { SegnalazioneDetail } from "@/components/segnalazioni/segnalazione-detail";

export default async function SegnalazioneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session } = await requireInquilino();
  const segnalazione = await getSegnalazioneDetail(id, session.user.id);
  if (!segnalazione) notFound();

  return (
    <SegnalazioneDetail
      segnalazione={segnalazione}
      currentUserId={session.user.id}
      puoModificareStato={segnalazione.creatoDaUserId === session.user.id}
      backHref="/inquilino/segnalazioni"
    />
  );
}
