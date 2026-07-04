import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/labels";

export function ProfiloContent({ nome, cognome, role }: { nome: string; cognome: string; role: string }) {
  const initials = `${nome[0] ?? ""}${cognome[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">
            {nome} {cognome}
          </p>
          <p className="mt-1 text-sm text-slate-500">{ROLE_LABELS[role] ?? role}</p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Sessione" description="Esci dal tuo account LOQO su questo dispositivo" />
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            Esci
          </Button>
        </form>
      </Card>
    </div>
  );
}
