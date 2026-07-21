import { requireAgenzia } from "@/lib/auth-helpers";
import { getImmobiliForAgenzia, getPrivatiDisponibili, getCondominiDisponibili } from "@/lib/data/agenzia";
import { NuovoContrattoWizard } from "@/components/agenzia/nuovo-contratto-wizard";

export default async function NuovoContrattoPage() {
  const { agenzia } = await requireAgenzia();
  const [immobili, privati, condomini] = await Promise.all([
    getImmobiliForAgenzia(agenzia.id),
    getPrivatiDisponibili(),
    getCondominiDisponibili(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Nuovo contratto</h1>
        <p className="mt-1 text-sm text-slate-500">Crea un nuovo contratto di locazione in pochi passaggi.</p>
      </div>
      <NuovoContrattoWizard
        immobiliIniziali={immobili}
        inquilini={privati}
        proprietari={privati}
        condomini={condomini}
      />
    </div>
  );
}
