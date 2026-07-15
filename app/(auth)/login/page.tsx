import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PORTAL_BY_ROLE } from "@/auth.config";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; profiloCreato?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(PORTAL_BY_ROLE[session.user.role] ?? "/");
  }

  const params = await searchParams;
  return (
    <div className="space-y-4">
      {params.profiloCreato && (
        <p className="rounded-control bg-success/10 px-4 py-3 text-center text-sm text-success ring-1 ring-inset ring-success/30">
          Profilo attivato. Accedi di nuovo per vederlo nel tuo account.
        </p>
      )}
      <LoginForm callbackUrl={params.callbackUrl} />
    </div>
  );
}
