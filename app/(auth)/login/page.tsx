import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PORTAL_BY_ROLE } from "@/auth.config";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(PORTAL_BY_ROLE[session.user.role] ?? "/");
  }

  const params = await searchParams;
  return <LoginForm callbackUrl={params.callbackUrl} />;
}
