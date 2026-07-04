import { requireAmministratore } from "@/lib/auth-helpers";
import {
  getSegnalazioniForAmministratore,
  getCondominiForAmministratore,
  getImmobiliPerSegnalazione,
} from "@/lib/data/amministratore";
import { SegnalazioniPageClient } from "@/components/amministratore/segnalazioni-page-client";

export default async function SegnalazioniPage() {
  const { amministratore } = await requireAmministratore();
  const [segnalazioni, condomini, immobili] = await Promise.all([
    getSegnalazioniForAmministratore(amministratore.id),
    getCondominiForAmministratore(amministratore.id),
    getImmobiliPerSegnalazione(amministratore.id),
  ]);

  return <SegnalazioniPageClient segnalazioni={segnalazioni} condomini={condomini} immobili={immobili} />;
}
