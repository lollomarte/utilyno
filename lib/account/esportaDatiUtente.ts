import { prisma } from "@/lib/prisma";

/**
 * Raccoglie i dati collegati a un account per l'export GDPR "diritto alla portabilità":
 * solo le entità di cui l'utente è titolare/parte, mai dati di altri utenti collegati
 * (es. un proprietario non deve poter esportare i dati personali del suo inquilino).
 * `passwordHash` non è mai incluso (omesso di default dal client Prisma, vedi lib/prisma.ts).
 * Un Privato può avere più relazioni contemporaneamente (es. proprietario di un immobile e
 * inquilino di un altro): l'export aggrega i dati di ciascun ruolo effettivamente ricoperto su
 * ogni immobile, non di un singolo ruolo dichiarato a livello di account.
 */
export async function esportaDatiUtente(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [datiAgenzia, datiPrivato, datiAmministratore] = await Promise.all([
    raccogliDatiAgenzia(userId),
    raccogliDatiPrivato(userId),
    raccogliDatiAmministratore(userId),
  ]);

  return {
    esportatoIl: new Date().toISOString(),
    account: user,
    ...datiAgenzia,
    ...datiPrivato,
    ...datiAmministratore,
  };
}

async function raccogliDatiAgenzia(userId: string) {
  const agenzia = await prisma.agenzia.findUnique({ where: { userId } });
  if (!agenzia) return {};
  const [immobili, contratti] = await Promise.all([
    prisma.immobile.findMany({ where: { agenziaId: agenzia.id } }),
    prisma.contratto.findMany({ where: { agenziaId: agenzia.id } }),
  ]);
  return { agenzia, immobili, contratti };
}

async function raccogliDatiPrivato(userId: string) {
  const privato = await prisma.privato.findUnique({ where: { userId } });
  if (!privato) return {};
  const [immobiliProprietario, contrattiProprietario, assicurazioni, contrattiInquilino] = await Promise.all([
    prisma.immobile.findMany({ where: { relazioni: { some: { privatoId: privato.id, ruolo: "PROPRIETARIO" } } } }),
    prisma.contratto.findMany({ where: { proprietarioId: privato.id } }),
    prisma.assicurazione.findMany({ where: { immobile: { relazioni: { some: { privatoId: privato.id, ruolo: "PROPRIETARIO" } } } } }),
    prisma.contratto.findMany({ where: { inquilinoId: privato.id }, include: { pagamenti: true } }),
  ]);
  return { privato, immobiliProprietario, contrattiProprietario, assicurazioni, contrattiInquilino };
}

async function raccogliDatiAmministratore(userId: string) {
  const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
  if (!amministratore) return {};
  const [condomini, comunicazioni] = await Promise.all([
    prisma.condominio.findMany({ where: { amministratoreId: amministratore.id } }),
    prisma.comunicazioneCondominiale.findMany({ where: { amministratoreId: amministratore.id } }),
  ]);
  return { condomini, comunicazioni };
}
