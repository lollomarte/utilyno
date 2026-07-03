import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PORTAL_BY_ROLE } from "@/auth.config";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(PORTAL_BY_ROLE[session.user.role] ?? "/login");
}
