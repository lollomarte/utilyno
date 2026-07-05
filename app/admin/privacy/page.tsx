import { requireAdmin } from "@/lib/auth-helpers";
import { trovaUtentePerEmail } from "@/lib/data/admin";
import { Card, CardHeader, DescriptionList } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnonimizzaAccountButton } from "@/components/admin/anonimizza-account-button";
import { ROLE_LABELS } from "@/lib/labels";

export default async function AdminPrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  await requireAdmin();
  const { email } = await searchParams;
  const utente = email ? await trovaUtentePerEmail(email) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Privacy account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cerca un account per email per anonimizzarlo su richiesta (diritto alla cancellazione)
        </p>
      </div>

      <Card>
        <form className="flex flex-col gap-4 sm:flex-row sm:items-end" method="get">
          <div className="flex-1">
            <Label htmlFor="email">Email account</Label>
            <Input id="email" name="email" type="email" defaultValue={email ?? ""} placeholder="nome@esempio.it" />
          </div>
          <Button type="submit">Cerca</Button>
        </form>
      </Card>

      {email && (
        <Card>
          {!utente ? (
            <CardHeader title="Nessun account trovato" description={`Nessun utente con email "${email}"`} />
          ) : (
            <>
              <CardHeader title={`${utente.nome} ${utente.cognome}`} description={utente.email} />
              <DescriptionList
                items={[
                  { label: "Ruolo", value: ROLE_LABELS[utente.role] ?? utente.role },
                  { label: "Telefono", value: utente.telefono ?? "-" },
                  { label: "Stato", value: utente.anonimizzatoAt ? "Anonimizzato" : "Attivo" },
                ]}
              />
              {!utente.anonimizzatoAt && (
                <div className="mt-6">
                  <AnonimizzaAccountButton userId={utente.id} email={utente.email} />
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
