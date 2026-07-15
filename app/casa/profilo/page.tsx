import { requirePrivato } from "@/lib/auth-helpers";
import { ProfiloContent } from "@/components/layout/profilo-content";

export default async function CasaProfiloPage() {
  const { session } = await requirePrivato();
  const haDoppioProfilo =
    session.user.profili.includes("PROPRIETARIO") && session.user.profili.includes("INQUILINO");

  return (
    <ProfiloContent
      nome={session.user.nome}
      cognome={session.user.cognome}
      role={session.user.role}
      roleLabel={haDoppioProfilo ? "Proprietario e Inquilino" : undefined}
    />
  );
}
