import { notFound, redirect } from "next/navigation";
import { requirePrivato } from "@/lib/auth-helpers";
import { getContestoImmobile } from "@/lib/immobili/getImmobiliUtente";
import { getContrattoPerImmobileInquilino } from "@/lib/data/inquilino";
import { ChecklistItem } from "@/components/inquilino/checklist-item";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";

export default async function ImmobileChecklistPage({ params }: { params: Promise<{ immobileId: string }> }) {
  const { immobileId } = await params;
  const { session } = await requirePrivato();
  const contesto = await getContestoImmobile(session.user.id, immobileId);
  if (!contesto) notFound();
  if (contesto.relazione === "PROPRIETARIO") redirect(`/casa/${immobileId}`);

  const contratto = await getContrattoPerImmobileInquilino(contesto.inquilinoId, immobileId);
  if (!contratto) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Checklist immobile</h1>
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
