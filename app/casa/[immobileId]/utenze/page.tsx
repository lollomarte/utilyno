import { notFound, redirect } from "next/navigation";
import { requirePrivato } from "@/lib/auth-helpers";
import { getContestoImmobile } from "@/lib/immobili/getImmobiliUtente";
import { getContrattoPerImmobileInquilino } from "@/lib/data/inquilino";
import { getUtenzeComplete, getFornitoriPerTutteLeUtenze } from "@/lib/data/utenze";
import { UtenzeSection } from "@/components/utenze/utenze-section";

export default async function ImmobileUtenzePage({ params }: { params: Promise<{ immobileId: string }> }) {
  const { immobileId } = await params;
  const { session } = await requirePrivato();
  const contesto = await getContestoImmobile(session.user.id, immobileId);
  if (!contesto) notFound();
  // Le utenze del proprietario si gestiscono già inline nella dashboard dell'immobile.
  if (contesto.relazione === "PROPRIETARIO") redirect(`/casa/${immobileId}`);

  const contratto = await getContrattoPerImmobileInquilino(contesto.inquilinoId, immobileId);
  if (!contratto) notFound();

  const [utenze, fornitoriPerTipo] = await Promise.all([
    getUtenzeComplete(contratto.immobileId),
    getFornitoriPerTutteLeUtenze(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Utenze</h1>
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
