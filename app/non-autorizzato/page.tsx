import Link from "next/link";
import { auth } from "@/auth";
import { PORTAL_BY_ROLE } from "@/auth.config";
import { Button } from "@/components/ui/button";

export default async function NonAutorizzatoPage() {
  const session = await auth();
  const homeHref = session?.user ? PORTAL_BY_ROLE[session.user.role] ?? "/login" : "/login";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Accesso non autorizzato</h1>
      <p className="max-w-md text-sm text-slate-500">
        Non hai i permessi necessari per visualizzare questa sezione della piattaforma WERENT.
      </p>
      <Link href={homeHref}>
        <Button>Torna al tuo portale</Button>
      </Link>
    </div>
  );
}
