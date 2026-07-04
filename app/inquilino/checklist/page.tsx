import { requireInquilino } from "@/lib/auth-helpers";
import { getContrattoAttivoForInquilino } from "@/lib/data/inquilino";
import { ChecklistItem } from "@/components/inquilino/checklist-item";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";

export default async function InquilinoChecklistPage() {
  const { inquilino } = await requireInquilino();
  const contratto = await getContrattoAttivoForInquilino(inquilino.id);

  if (!contratto) {
    return (
      <Card>
        <CardHeader title="Nessun contratto attivo" description="Non risulta al momento un contratto di locazione attivo." />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Checklist immobile</h1>
        <p className="mt-1 text-sm text-slate-500">Conferma con la tua firma le checklist di ingresso e uscita</p>
      </div>

      <Card>
        {contratto.checklist.length === 0 ? (
          <EmptyState message="Nessuna checklist disponibile." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {contratto.checklist.map((c) => (
              <ChecklistItem
                key={c.id}
                id={c.id}
                tipo={c.tipo}
                note={c.note}
                fotoCount={c.fotoUrls.length}
                dataCompilazione={c.dataCompilazione}
                firmaInquilinoAt={c.firmaInquilinoAt}
                firmaProprietarioAt={c.firmaProprietarioAt}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
