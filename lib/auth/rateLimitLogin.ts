import { subMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";

/** Dopo questi tentativi falliti consecutivi sulla stessa email, l'account è bloccato temporaneamente. */
const MAX_TENTATIVI_FALLITI = 5;
/** Durata del blocco e finestra entro cui i tentativi falliti vengono contati. */
const FINESTRA_BLOCCO_MINUTI = 15;

/**
 * True se l'email ha già raggiunto la soglia di tentativi falliti nella finestra corrente:
 * in tal caso il login va rifiutato a prescindere dalla correttezza della password, altrimenti
 * un attaccante che azzecca la password all'ultimo tentativo utile bypasserebbe il blocco.
 */
export async function isLoginBloccato(email: string): Promise<boolean> {
  const dallaSoglia = subMinutes(new Date(), FINESTRA_BLOCCO_MINUTI);
  const tentativiFalliti = await prisma.tentativoLogin.count({
    where: { email, esito: false, createdAt: { gte: dallaSoglia } },
  });
  return tentativiFalliti >= MAX_TENTATIVI_FALLITI;
}

/**
 * Registra l'esito di un tentativo di login e, in corsa, ripulisce le righe di questa email
 * più vecchie della finestra di blocco: tiene la tabella piccola senza bisogno di un cron
 * separato (stesso principio "lazy cleanup" già usato per gli stati dei pagamenti).
 */
export async function registraTentativoLogin(email: string, esito: boolean): Promise<void> {
  const dallaSoglia = subMinutes(new Date(), FINESTRA_BLOCCO_MINUTI);
  await prisma.$transaction([
    prisma.tentativoLogin.create({ data: { email, esito } }),
    prisma.tentativoLogin.deleteMany({ where: { email, createdAt: { lt: dallaSoglia } } }),
  ]);
}

export const RATE_LIMIT_LOGIN = { MAX_TENTATIVI_FALLITI, FINESTRA_BLOCCO_MINUTI } as const;
