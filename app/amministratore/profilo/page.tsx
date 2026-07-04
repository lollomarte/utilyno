import { requireAmministratore } from "@/lib/auth-helpers";
import { ProfiloContent } from "@/components/layout/profilo-content";

export default async function ProfiloPage() {
  const { session } = await requireAmministratore();
  return <ProfiloContent nome={session.user.nome} cognome={session.user.cognome} role={session.user.role} />;
}
