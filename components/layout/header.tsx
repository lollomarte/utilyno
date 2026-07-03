import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function Header({ nome, cognome, roleLabel }: { nome: string; cognome: string; roleLabel: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {nome} {cognome}
          </p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">
            Esci
          </Button>
        </form>
      </div>
    </header>
  );
}
