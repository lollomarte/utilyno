import { prisma } from "@/lib/prisma";

/**
 * Raccoglie i dati collegati a un account per l'export GDPR "diritto alla portabilità":
 * solo le entità di cui l'utente è titolare/parte, mai dati di altri utenti collegati
 * (es. un proprietario non deve poter esportare i dati personali del suo inquilino).
 * `passwordHash` non è mai incluso (omesso di default dal client Prisma, vedi lib/prisma.ts).
 * Un utente può possedere più profili contemporaneamente (es. Proprietario di un immobile e
 * Inquilino di un altro): l'export aggrega i dati di ciascun profilo effettivamente posseduto,
 * non di un singolo ruolo dichiarato.
 */
export async function esportaDatiUtente(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [datiAgenzia, datiProprietario, datiInquilino, datiAmministratore] = await Promise.all([
    raccogliDatiAgenzia(userId),
    raccogliDatiProprietario(userId),
    raccogliDatiInquilino(userId),
    raccogliDatiAmministratore(userId),
  ]);

  return {
    esportatoIl: new Date().toISOString(),
    account: user,
    ...datiAgenzia,
    ...datiProprietario,
    ...datiInquilino,
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

async function raccogliDatiProprietario(userId: string) {
  const proprietario = await prisma.proprietario.findUnique({ where: { userId } });
  if (!proprietario) return {};
  const immobili = await prisma.immobile.findMany({ where: { proprietarioId: proprietario.id } });
  const [contratti, assicurazioni] = await Promise.all([
    prisma.contratto.findMany({ where: { immobile: { proprietarioId: proprietario.id } } }),
    prisma.assicurazione.findMany({ where: { immobile: { proprietarioId: proprietario.id } } }),
  ]);
  return { proprietario, immobiliProprietario: immobili, contrattiProprietario: contratti, assicurazioni };
}

async function raccogliDatiInquilino(userId: string) {
  const inquilino = await prisma.inquilino.findUnique({ where: { userId } });
  if (!inquilino) return {};
  const contratti = await prisma.contratto.findMany({
    where: { inquilinoId: inquilino.id },
    include: { pagamenti: true },
  });
  return { inquilino, contrattiInquilino: contratti };
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
