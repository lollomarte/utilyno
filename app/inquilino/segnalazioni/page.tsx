import { requireInquilino } from "@/lib/auth-helpers";
import { getContrattoAttivoForInquilino } from "@/lib/data/inquilino";
import { getSegnalazioniPerUser } from "@/lib/data/segnalazioni";
import { SegnalazioniPageClient } from "@/components/segnalazioni/segnalazioni-page-client";
import { Card, CardHeader } from "@/components/ui/card";

export default async function SegnalazioniPage() {
  const { session, inquilino } = await requireInquilino();
  const contratto = await getContrattoAttivoForInquilino(inquilino.id);

  if (!contratto) {
    return (
      <Card>
        <CardHeader title="Nessun contratto attivo" description="Non risulta al momento un contratto di locazione attivo." />
      </Card>
    );
  }

  const segnalazioni = await getSegnalazioniPerUser(session.user.id);

  return (
    <SegnalazioniPageClient
      title="Segnalazioni"
      description="Consulta lo stato delle tue segnalazioni o aprine una nuova"
      segnalazioni={segnalazioni}
      immobili={[contratto.immobile]}
      basePath="/inquilino/segnalazioni"
    />
  );
}
