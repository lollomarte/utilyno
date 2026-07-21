import { notFound } from "next/navigation";
import { requirePrivato } from "@/lib/auth-helpers";
import { getContestoImmobile } from "@/lib/immobili/getImmobiliUtente";
import { getImmobileDetailForProprietario, getContrattoPerImmobileInquilino } from "@/lib/data/privato";
import { getSegnalazioniPerUser } from "@/lib/data/segnalazioni";
import { SegnalazioniPageClient } from "@/components/segnalazioni/segnalazioni-page-client";

export default async function ImmobileSegnalazioniPage({ params }: { params: Promise<{ immobileId: string }> }) {
  const { immobileId } = await params;
  const { session } = await requirePrivato();
  const contesto = await getContestoImmobile(session.user.id, immobileId);
  if (!contesto) notFound();

  const segnalazioniTutte = await getSegnalazioniPerUser(session.user.id);
  // getSegnalazioniPerUser aggrega su TUTTE le segnalazioni a cui l'utente partecipa (anche su
  // altri immobili, se ha più relazioni/contratti): qui vanno filtrate a questo immobile.
  const segnalazioni = segnalazioniTutte.filter((s) => s.immobileId === immobileId);

  if (contesto.relazione === "PROPRIETARIO") {
    const immobile = await getImmobileDetailForProprietario(immobileId, contesto.privatoId);
    if (!immobile) notFound();

    return (
      <SegnalazioniPageClient
        title="Segnalazioni"
        description="Segnalazioni relative a questo immobile"
        segnalazioni={segnalazioni}
        immobili={[immobile]}
        basePath="/privato/segnalazioni"
      />
    );
  }

  const contratto = await getContrattoPerImmobileInquilino(contesto.privatoId, immobileId);
  if (!contratto) notFound();

  return (
    <SegnalazioniPageClient
      title="Segnalazioni"
      description="Consulta lo stato delle tue segnalazioni o aprine una nuova"
      segnalazioni={segnalazioni}
      immobili={[contratto.immobile]}
      basePath="/privato/segnalazioni"
    />
  );
}
