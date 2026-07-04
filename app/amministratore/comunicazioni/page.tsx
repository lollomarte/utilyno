import { requireAmministratore } from "@/lib/auth-helpers";
import { getComunicazioniPerAmministratore, getCondominiForAmministratore } from "@/lib/data/amministratore";
import { NuovaComunicazioneForm } from "@/components/amministratore/nuova-comunicazione-form";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default async function ComunicazioniPage() {
  const { amministratore } = await requireAmministratore();
  const [comunicazioni, condomini] = await Promise.all([
    getComunicazioniPerAmministratore(amministratore.id),
    getCondominiForAmministratore(amministratore.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Comunicazioni</h1>
        <p className="mt-1 text-sm text-slate-500">Comunicazioni inviate a tutto il condominio, su tutti i condomini gestiti</p>
      </div>

      <Card>
        <CardHeader title="Invia una nuova comunicazione" description="Raggiunge tutti gli inquilini e i proprietari con un'unità nel condominio selezionato" />
        <NuovaComunicazioneForm condomini={condomini.map((c) => ({ id: c.id, nome: c.nome, comune: c.comune }))} />
      </Card>

      <Card>
        <CardHeader title="Storico comunicazioni" />
        {comunicazioni.length === 0 ? (
          <EmptyState message="Nessuna comunicazione inviata finora." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {comunicazioni.map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-ink">{c.titolo}</p>
                  <span className="whitespace-nowrap text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{c.testo}</p>
                <p className="mt-1 text-xs text-slate-400">{c.condominio.nome}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
