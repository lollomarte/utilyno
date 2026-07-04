import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserBlock({
  nome,
  cognome,
  roleLabel,
  className,
}: {
  nome: string;
  cognome: string;
  roleLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="text-right">
        <p className="text-sm font-medium text-ink">
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
  );
}

export function Header({ nome, cognome, roleLabel }: { nome: string; cognome: string; roleLabel: string }) {
  return (
    <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-6 md:flex">
      <div />
      <UserBlock nome={nome} cognome={cognome} roleLabel={roleLabel} />
    </header>
  );
}
