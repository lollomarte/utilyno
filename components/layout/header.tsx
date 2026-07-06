import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifiche/notification-bell";
import { CommandPaletteTrigger } from "@/components/layout/command-palette";
import type { Notifica } from "@/lib/notifiche/raccogliNotifiche";
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
        <p className="text-xs text-ink-muted">{roleLabel}</p>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="secondary">
          Esci
        </Button>
      </form>
    </div>
  );
}

export function Header({
  nome,
  cognome,
  roleLabel,
  notifiche,
}: {
  nome: string;
  cognome: string;
  roleLabel: string;
  notifiche: Notifica[];
}) {
  return (
    <header className="hidden h-16 items-center justify-between border-b border-border bg-surface px-6 md:flex">
      <div />
      <div className="flex items-center gap-3">
        <CommandPaletteTrigger />
        <NotificationBell notifiche={notifiche} />
        <UserBlock nome={nome} cognome={cognome} roleLabel={roleLabel} />
      </div>
    </header>
  );
}
