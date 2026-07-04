import { requireAmministratore } from "@/lib/auth-helpers";
import { getImmobiliPerSegnalazione } from "@/lib/data/amministratore";
import { getSegnalazioniPerUser } from "@/lib/data/segnalazioni";
import { SegnalazioniPageClient } from "@/components/segnalazioni/segnalazioni-page-client";

export default async function SegnalazioniPage() {
  const { session, amministratore } = await requireAmministratore();
  const [segnalazioni, immobili] = await Promise.all([
    getSegnalazioniPerUser(session.user.id),
    getImmobiliPerSegnalazione(amministratore.id),
  ]);

  return (
    <SegnalazioniPageClient
      title="Segnalazioni condominiali"
      description="Gestisci problematiche, interventi e stato delle segnalazioni"
      segnalazioni={segnalazioni}
      immobili={immobili}
      basePath="/amministratore/segnalazioni"
    />
  );
}
