import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/**
 * Raccoglie i dati collegati a un account per l'export GDPR "diritto alla portabilità":
 * solo le entità di cui l'utente è titolare/parte, mai dati di altri utenti collegati
 * (es. un proprietario non deve poter esportare i dati personali del suo inquilino).
 * `passwordHash` non è mai incluso (omesso di default dal client Prisma, vedi lib/prisma.ts).
 */
export async function esportaDatiUtente(userId: string, role: Role) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const datiRuolo = await raccogliDatiRuolo(userId, role);

  return {
    esportatoIl: new Date().toISOString(),
    account: user,
    ...datiRuolo,
  };
}

async function raccogliDatiRuolo(userId: string, role: Role) {
  switch (role) {
    case "AGENZIA": {
      const agenzia = await prisma.agenzia.findUnique({ where: { userId } });
      if (!agenzia) return {};
      const [immobili, contratti] = await Promise.all([
        prisma.immobile.findMany({ where: { agenziaId: agenzia.id } }),
        prisma.contratto.findMany({ where: { agenziaId: agenzia.id } }),
      ]);
      return { agenzia, immobili, contratti };
    }
    case "PROPRIETARIO": {
      const proprietario = await prisma.proprietario.findUnique({ where: { userId } });
      if (!proprietario) return {};
      const immobili = await prisma.immobile.findMany({ where: { proprietarioId: proprietario.id } });
      const [contratti, assicurazioni] = await Promise.all([
        prisma.contratto.findMany({ where: { immobile: { proprietarioId: proprietario.id } } }),
        prisma.assicurazione.findMany({ where: { immobile: { proprietarioId: proprietario.id } } }),
      ]);
      return { proprietario, immobili, contratti, assicurazioni };
    }
    case "INQUILINO": {
      const inquilino = await prisma.inquilino.findUnique({ where: { userId } });
      if (!inquilino) return {};
      const contratti = await prisma.contratto.findMany({
        where: { inquilinoId: inquilino.id },
        include: { pagamenti: true },
      });
      return { inquilino, contratti };
    }
    case "AMMINISTRATORE": {
      const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
      if (!amministratore) return {};
      const [condomini, comunicazioni] = await Promise.all([
        prisma.condominio.findMany({ where: { amministratoreId: amministratore.id } }),
        prisma.comunicazioneCondominiale.findMany({ where: { amministratoreId: amministratore.id } }),
      ]);
      return { condomini, comunicazioni };
    }
    default:
      return {};
  }
}
