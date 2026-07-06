import { prisma } from "@/lib/prisma";
import type { ContestoDocumento } from "./risolviDestinatariDocumento";

/** Verifica che l'utente corrente abbia una relazione legittima con il contesto (immobile,
 * contratto o condominio) a cui vuole collegare un documento: stesso spirito di
 * verificaAccessoImmobile in app/actions/segnalazioni.ts, esteso ai tre tipi di contesto. */
export async function verificaAccessoContesto(
  userId: string,
  role: string,
  contesto: ContestoDocumento
): Promise<boolean> {
  switch (contesto.tipo) {
    case "IMMOBILE": {
      const immobile = await prisma.immobile.findUnique({
        where: { id: contesto.id },
        include: {
          proprietario: true,
          agenzia: true,
          condominio: true,
          contratti: { where: { stato: "ATTIVO" }, include: { inquilino: true }, take: 1 },
        },
      });
      if (!immobile) return false;
      switch (role) {
        case "PROPRIETARIO":
          return immobile.proprietario.userId === userId;
        case "AGENZIA":
          return immobile.agenzia?.userId === userId;
        case "AMMINISTRATORE": {
          if (!immobile.condominio) return false;
          const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
          return amministratore?.id === immobile.condominio.amministratoreId;
        }
        case "INQUILINO":
          return immobile.contratti[0]?.inquilino.userId === userId;
        default:
          return false;
      }
    }
    case "CONTRATTO": {
      const contratto = await prisma.contratto.findUnique({
        where: { id: contesto.id },
        include: { immobile: { include: { proprietario: true, agenzia: true, condominio: true } }, inquilino: true },
      });
      if (!contratto) return false;
      switch (role) {
        case "PROPRIETARIO":
          return contratto.immobile.proprietario.userId === userId;
        case "AGENZIA":
          return contratto.immobile.agenzia?.userId === userId;
        case "INQUILINO":
          return contratto.inquilino.userId === userId;
        case "AMMINISTRATORE": {
          if (!contratto.immobile.condominio) return false;
          const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
          return amministratore?.id === contratto.immobile.condominio.amministratoreId;
        }
        default:
          return false;
      }
    }
    case "CONDOMINIO": {
      const condominio = await prisma.condominio.findUnique({ where: { id: contesto.id } });
      if (!condominio) return false;
      if (role !== "AMMINISTRATORE") return false;
      const amministratore = await prisma.amministratore.findUnique({ where: { userId } });
      return amministratore?.id === condominio.amministratoreId;
    }
    default:
      return false;
  }
}
