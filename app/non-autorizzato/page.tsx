import Link from "next/link";
import { auth } from "@/auth";
import { resolvePortalForSession } from "@/lib/auth-helpers";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function NonAutorizzatoPage() {
  const session = await auth();
  const portalHref = session?.user ? await resolvePortalForSession(session.user.id, session.user.role) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">Accesso non autorizzato</h1>

      {portalHref ? (
        <>
          <p className="max-w-md text-sm text-slate-500">
            Non hai i permessi necessari per visualizzare questa sezione della piattaforma LOQO.
          </p>
          <Link
            href={portalHref}
            className="touch-target inline-flex items-center justify-center rounded-control bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Torna al tuo portale
          </Link>
        </>
      ) : (
        <>
          <p className="max-w-md text-sm text-slate-500">
            La tua sessione non è più valida. Accedi di nuovo per continuare.
          </p>
          <form action={logoutAction}>
            <Button type="submit">Esci e accedi di nuovo</Button>
          </form>
        </>
      )}
    </div>
  );
}
