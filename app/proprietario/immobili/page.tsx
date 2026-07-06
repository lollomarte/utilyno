import { requireProprietario } from "@/lib/auth-helpers";
import { getImmobiliForProprietario } from "@/lib/data/proprietario";
import { ImmobiliProprietarioPageClient } from "@/components/immobili/immobili-proprietario-page-client";

export default async function ProprietarioImmobiliPage() {
  const { proprietario } = await requireProprietario();
  const immobili = await getImmobiliForProprietario(proprietario.id);

  return <ImmobiliProprietarioPageClient immobili={immobili} />;
}
