import { requireAgenzia } from "@/lib/auth-helpers";
import { getProprietariDisponibili, getCondominiDisponibili } from "@/lib/data/agenzia";
import { NuovoImmobileForm } from "@/components/agenzia/nuovo-immobile-form";
import { Card } from "@/components/ui/card";

export default async function NuovoImmobilePage() {
  await requireAgenzia();
  const [proprietari, condomini] = await Promise.all([getProprietariDisponibili(), getCondominiDisponibili()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Nuovo immobile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Registra un nuovo immobile nel portfolio. Se il proprietario non è ancora a sistema puoi crearlo al volo.
        </p>
      </div>
      <Card>
        <NuovoImmobileForm proprietari={proprietari} condomini={condomini} />
      </Card>
    </div>
  );
}
