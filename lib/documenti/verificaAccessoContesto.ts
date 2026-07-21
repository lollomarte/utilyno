import { prisma } from "@/lib/prisma";
import type { ContestoDocumento } from "./risolviDestinatariDocumento";

/** Verifica che l'utente corrente abbia una relazione legittima con il contesto (immobile,
 * contratto o condominio) a cui vuole collegare un documento: stesso spirito di
 * verificaAccessoImmobile in app/actions/segnalazioni.ts, esteso ai tre tipi di contesto.
 * Controlla tutte le relazioni possibili dell'utente, non un singolo ruolo dichiarato: un
 * utente può essere proprietario di un immobile e inquilino di un altro contemporaneamente. */
export async function verificaAccessoContesto(userId: string, contesto: ContestoDocumento): Promise<boolean> {
  switch (contesto.tipo) {
    case "IMMOBILE": {
      const immobile = await prisma.immobile.findUnique({
        where: { id: contesto.id },
        include: {
          agenzia: true,
          condominio: true,
          relazioni: { where: { stato: "ATTIVA" }, include: { privato: true } },
        },
      });
      if (!immobile) return false;
      if (immobile.relazioni.some((r) => r.privato.userId === userId)) return true;
      if (immobile.agenzia?.userId === userId) return true;
      if (immobile.condominio) {
        const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
        if (amministratore?.id === immobile.condominio.amministratoreId) return true;
      }
      return false;
    }
    case "CONTRATTO": {
      const contratto = await prisma.contratto.findUnique({
        where: { id: contesto.id },
        include: {
          proprietario: true,
          inquilino: true,
          immobile: { include: { agenzia: true, condominio: true } },
        },
      });
      if (!contratto) return false;
      if (contratto.proprietario.userId === userId) return true;
      if (contratto.inquilino.userId === userId) return true;
      if (contratto.immobile.agenzia?.userId === userId) return true;
      if (contratto.immobile.condominio) {
        const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
        if (amministratore?.id === contratto.immobile.condominio.amministratoreId) return true;
      }
      return false;
    }
    case "CONDOMINIO": {
      const condominio = await prisma.condominio.findUnique({ where: { id: contesto.id } });
      if (!condominio) return false;
      const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
      return amministratore?.id === condominio.amministratoreId;
    }
    default:
      return false;
  }
}
