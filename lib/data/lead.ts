import { prisma } from "@/lib/prisma";
import { CATEGORIA_INTERVENTO_LABELS } from "@/lib/labels";
import type { CategoriaIntervento, StatoRichiestaPreventivo } from "@prisma/client";

export async function getPartnerList() {
  return prisma.partner.findMany({ orderBy: { nome: "asc" } });
}

export async function getPartnerAttivi() {
  return prisma.partner.findMany({ where: { attivo: true }, orderBy: { nome: "asc" } });
}

export interface FiltriRichiestePreventivo {
  categoria?: CategoriaIntervento;
  partnerId?: string;
  stato?: StatoRichiestaPreventivo;
}

export async function getRichiestePreventivo(filtri: FiltriRichiestePreventivo) {
  return prisma.richiestaPreventivo.findMany({
    where: {
      partnerId: filtri.partnerId,
      stato: filtri.stato,
      partner: filtri.categoria ? { categoria: filtri.categoria } : undefined,
    },
    include: {
      segnalazione: { include: { immobile: true } },
      partner: true,
      richiedente: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLeadAggregatoPerCategoria() {
  const richieste = await prisma.richiestaPreventivo.findMany({ select: { partner: { select: { categoria: true } } } });
  const conteggio = new Map<CategoriaIntervento, number>();
  for (const r of richieste) {
    conteggio.set(r.partner.categoria, (conteggio.get(r.partner.categoria) ?? 0) + 1);
  }
  return Array.from(conteggio.entries())
    .map(([categoria, count]) => ({ categoria, label: CATEGORIA_INTERVENTO_LABELS[categoria], count }))
    .sort((a, b) => b.count - a.count);
}

export async function getLeadAggregatoPerPartner() {
  const partners = await prisma.partner.findMany({
    include: { _count: { select: { richiestePreventivo: true } } },
    orderBy: { nome: "asc" },
  });
  return partners
    .map((p) => ({ id: p.id, nome: p.nome, categoria: p.categoria, count: p._count.richiestePreventivo }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);
}
