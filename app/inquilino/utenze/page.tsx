import { requireInquilino } from "@/lib/auth-helpers";
import { getContrattoAttivoForInquilino } from "@/lib/data/inquilino";
import { getUtenzeComplete, getFornitoriPerTutteLeUtenze } from "@/lib/data/utenze";
import { UtenzeSection } from "@/components/utenze/utenze-section";
import { Card, CardHeader } from "@/components/ui/card";

export default async function InquilinoUtenzePage() {
  const { inquilino } = await requireInquilino();
  const contratto = await getContrattoAttivoForInquilino(inquilino.id);

  if (!contratto) {
    return (
      <Card>
        <CardHeader title="Nessun contratto attivo" description="Non risulta al momento un contratto di locazione attivo." />
      </Card>
    );
  }

  const [utenze, fornitoriPerTipo] = await Promise.all([
    getUtenzeComplete(contratto.immobileId),
    getFornitoriPerTutteLeUtenze(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Utenze</h1>
        <p className="mt-1 text-sm text-slate-500">
          {contratto.immobile.indirizzo}, {contratto.immobile.comune}
        </p>
      </div>

      <UtenzeSection
        immobileId={contratto.immobileId}
        utenze={utenze}
        fornitoriPerTipo={fornitoriPerTipo}
        readOnly={contratto.stato !== "ATTIVO"}
      />
    </div>
  );
}
