import { requireAgenzia } from "@/lib/auth-helpers";
import { getImmobiliForAgenzia } from "@/lib/data/agenzia";
import { getSegnalazioniPerUser } from "@/lib/data/segnalazioni";
import { SegnalazioniPageClient } from "@/components/segnalazioni/segnalazioni-page-client";

export default async function SegnalazioniPage() {
  const { session, agenzia } = await requireAgenzia();
  const [segnalazioni, immobili] = await Promise.all([
    getSegnalazioniPerUser(session.user.id),
    getImmobiliForAgenzia(agenzia.id),
  ]);

  return (
    <SegnalazioniPageClient
      title="Segnalazioni"
      description="Segnalazioni relative agli immobili in gestione"
      segnalazioni={segnalazioni}
      immobili={immobili}
      basePath="/agenzia/segnalazioni"
    />
  );
}
