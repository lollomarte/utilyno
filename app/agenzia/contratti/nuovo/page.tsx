import { requireAgenzia } from "@/lib/auth-helpers";
import { getImmobiliForAgenzia, getInquiliniDisponibili, getProprietariDisponibili, getCondominiDisponibili } from "@/lib/data/agenzia";
import { NuovoContrattoWizard } from "@/components/agenzia/nuovo-contratto-wizard";

export default async function NuovoContrattoPage() {
  const { agenzia } = await requireAgenzia();
  const [immobili, inquilini, proprietari, condomini] = await Promise.all([
    getImmobiliForAgenzia(agenzia.id),
    getInquiliniDisponibili(),
    getProprietariDisponibili(),
    getCondominiDisponibili(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Nuovo contratto</h1>
        <p className="mt-1 text-sm text-slate-500">Crea un nuovo contratto di locazione in pochi passaggi.</p>
      </div>
      <NuovoContrattoWizard
        immobiliIniziali={immobili}
        inquilini={inquilini}
        proprietari={proprietari}
        condomini={condomini}
      />
    </div>
  );
}
