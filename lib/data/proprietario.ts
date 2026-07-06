import { addDays, addYears, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/lib/prisma";

export async function getImmobiliForProprietario(proprietarioId: string) {
  return prisma.immobile.findMany({
    where: { proprietarioId },
    include: {
      contratti: {
        where: { stato: "ATTIVO" },
        include: { inquilino: { include: { user: true } } },
      },
      assicurazioni: { orderBy: { dataScadenza: "asc" } },
      /** Solo l'ultima richiesta di gestione per immobile: basta a sapere se è in attesa,
       * rifiutata, o se non ne è mai stata inviata una (array vuoto). */
      richiesteGestione: { include: { agenzia: true }, orderBy: { dataRichiesta: "desc" }, take: 1 },
    },
    orderBy: { indirizzo: "asc" },
  });
}

export interface ScadenzaProprietario {
  tipo: string;
  immobileId: string;
  immobile: string;
  data: Date;
}

/** Rinnovi contratto, registrazione AdE e scadenze assicurazione su tutti gli immobili del
 * proprietario: pura computazione su dati già caricati (nessuna query qui), condivisa dalla
 * dashboard e dal centro notifiche così la logica non vive duplicata in due posti. */
export function calcolaScadenzeProprietario(
  immobili: Awaited<ReturnType<typeof getImmobiliForProprietario>>
): ScadenzaProprietario[] {
  const scadenze: ScadenzaProprietario[] = [];
  const contrattiAttivi = immobili.flatMap((immobile) => immobile.contratti.map((c) => ({ ...c, immobile })));

  for (const contratto of contrattiAttivi) {
    scadenze.push({
      tipo: "Rinnovo contratto",
      immobileId: contratto.immobile.id,
      immobile: `${contratto.immobile.indirizzo}, ${contratto.immobile.comune}`,
      data: contratto.dataFine,
    });
    const baseRegistrazione = contratto.dataUltimoRinnovoRegistrazione ?? contratto.dataRegistrazioneAdE;
    if (baseRegistrazione) {
      scadenze.push({
        tipo: "Rinnovo registrazione AdE",
        immobileId: contratto.immobile.id,
        immobile: `${contratto.immobile.indirizzo}, ${contratto.immobile.comune}`,
        data: addYears(baseRegistrazione, 1),
      });
    }
  }
  for (const immobile of immobili) {
    for (const assicurazione of immobile.assicurazioni) {
      scadenze.push({
        tipo: "Scadenza assicurazione",
        immobileId: immobile.id,
        immobile: `${immobile.indirizzo}, ${immobile.comune}`,
        data: assicurazione.dataScadenza,
      });
    }
  }
  scadenze.sort((a, b) => a.data.getTime() - b.data.getTime());
  return scadenze;
}

export async function getProprietarioDashboardStats(proprietarioId: string) {
  const immobili = await getImmobiliForProprietario(proprietarioId);
  const contrattiAttivi = immobili.flatMap((i) => i.contratti);

  const canoneMedio =
    contrattiAttivi.length > 0
      ? contrattiAttivi.reduce((sum, c) => sum + c.canoneMensile, 0) / contrattiAttivi.length
      : 0;

  const immobiliOccupati = immobili.filter((i) => i.contratti.length > 0).length;

  const now = new Date();
  const prossimiIncassi = await prisma.pagamento.findMany({
    where: {
      stato: "PROGRAMMATO",
      dataScadenza: { gte: now, lte: addDays(now, 30) },
      contratto: { immobile: { proprietarioId } },
    },
    include: { contratto: { include: { immobile: true } } },
    orderBy: { dataScadenza: "asc" },
  });

  return {
    numeroImmobili: immobili.length,
    canoneMedio,
    immobiliOccupati,
    prossimiIncassi,
  };
}

/** Tutti i contratti (qualsiasi stato) sugli immobili del proprietario, con inquilino e pagamenti. */
export async function getContrattiForProprietario(proprietarioId: string) {
  return prisma.contratto.findMany({
    where: { immobile: { proprietarioId } },
    include: {
      immobile: true,
      inquilino: { include: { user: true } },
      pagamenti: { orderBy: { dataScadenza: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Tutti i pagamenti (qualsiasi stato) sugli immobili del proprietario, per la vista "Pagamenti e Depositi". */
export async function getPagamentiPerProprietario(proprietarioId: string) {
  return prisma.pagamento.findMany({
    where: { contratto: { immobile: { proprietarioId } } },
    include: { contratto: { include: { immobile: true } } },
    orderBy: { dataScadenza: "desc" },
  });
}

export async function getDepositiDaRestituire(proprietarioId: string) {
  return prisma.contratto.findMany({
    where: {
      immobile: { proprietarioId },
      stato: { in: ["SCADUTO", "RISOLTO"] },
      depositoStato: { in: ["VERSATO", "IN_CONTESTAZIONE"] },
    },
    include: { immobile: true, inquilino: { include: { user: true } } },
    orderBy: { dataFine: "desc" },
  });
}

export async function getPagamentiInRitardoPerProprietario(proprietarioId: string) {
  return prisma.pagamento.findMany({
    where: {
      stato: { in: ["IN_RITARDO", "INSOLUTO"] },
      contratto: { immobile: { proprietarioId } },
    },
    include: { contratto: { include: { immobile: true, inquilino: { include: { user: true } } } } },
    orderBy: { dataScadenza: "asc" },
  });
}

export async function getComunicazioniPerProprietario(proprietarioId: string, userId: string) {
  const condomini = await prisma.immobile.findMany({
    where: { proprietarioId, condominioId: { not: null } },
    select: { condominioId: true },
    distinct: ["condominioId"],
  });
  const condominioIds = condomini.map((c) => c.condominioId).filter((id): id is string => !!id);
  if (condominioIds.length === 0) return [];

  return prisma.comunicazioneCondominiale.findMany({
    where: { condominioId: { in: condominioIds } },
    include: { condominio: true, letture: { where: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Totale incassato (pagamenti PAGATO) mese per mese, ultimi 6 mesi incluso quello corrente.
 * Una sola query per l'intera finestra (non 6 in parallelo, che sotto il limite di
 * connessioni del pool si accodavano invece di essere davvero concorrenti). */
export async function getAndamentoIncassiProprietario(proprietarioId: string) {
  const now = new Date();
  const mesi = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));

  const pagamenti = await prisma.pagamento.findMany({
    where: {
      stato: "PAGATO",
      dataPagamento: { gte: startOfMonth(mesi[0]), lte: endOfMonth(mesi[mesi.length - 1]) },
      contratto: { immobile: { proprietarioId } },
    },
    select: { dataPagamento: true, importo: true },
  });

  return mesi.map((mese) => {
    const inizio = startOfMonth(mese).getTime();
    const fine = endOfMonth(mese).getTime();
    const importo = pagamenti
      .filter((p) => p.dataPagamento && p.dataPagamento.getTime() >= inizio && p.dataPagamento.getTime() <= fine)
      .reduce((sum, p) => sum + p.importo, 0);
    return { mese: format(mese, "MMM", { locale: it }), importo };
  });
}

export async function getImmobileDetailForProprietario(immobileId: string, proprietarioId: string) {
  return prisma.immobile.findFirst({
    where: { id: immobileId, proprietarioId },
    include: {
      contratti: {
        include: {
          inquilino: { include: { user: true } },
          pagamenti: { orderBy: { dataScadenza: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      assicurazioni: { orderBy: { dataScadenza: "asc" } },
      segnalazioni: {
        include: { creatoDa: true, _count: { select: { risposte: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
