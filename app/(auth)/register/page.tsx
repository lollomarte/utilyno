import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PORTAL_BY_ROLE } from "@/auth.config";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect(PORTAL_BY_ROLE[session.user.role] ?? "/");
  }

  return <RegisterForm />;
}
