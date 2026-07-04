import { requireAmministratore } from "@/lib/auth-helpers";
import { NuovoCondominioForm } from "@/components/amministratore/nuovo-condominio-form";
import { Card } from "@/components/ui/card";

export default async function NuovoCondominioPage() {
  await requireAmministratore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Nuovo condominio</h1>
        <p className="mt-1 text-sm text-slate-500">Registra un nuovo condominio da gestire.</p>
      </div>
      <Card>
        <NuovoCondominioForm />
      </Card>
    </div>
  );
}
