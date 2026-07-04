"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { segnaSegnalazioneLettaAction, aggiungiRispostaAction, richiediPreventivoAction } from "@/app/actions/segnalazioni";
import { StatoSegnalazioneSelect } from "@/components/segnalazioni/stato-select";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, StatoSegnalazioneBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  STATO_SEGNALAZIONE_LABELS,
  CATEGORIA_SEGNALAZIONE_LABELS,
  CATEGORIA_INTERVENTO_LABELS,
  STATO_RICHIESTA_PREVENTIVO_LABELS,
  ROLE_LABELS,
} from "@/lib/labels";
import type { CategoriaSegnalazione, CategoriaIntervento, StatoSegnalazione, StatoRichiestaPreventivo } from "@prisma/client";

interface Persona {
  nome: string;
  cognome: string;
  role: string;
}

export interface SegnalazioneDetailData {
  id: string;
  titolo: string;
  descrizione: string;
  categoria: CategoriaSegnalazione | null;
  categoriaIntervento: CategoriaIntervento | null;
  priorita: string;
  stato: StatoSegnalazione;
  createdAt: Date;
  creatoDaUserId: string;
  creatoDa: Persona;
  immobile: { indirizzo: string; comune: string; condominio: { nome: string } | null };
  destinatari: { userId: string; letto: boolean; dataLettura: Date | null; user: Persona }[];
  risposte: { id: string; testo: string; createdAt: Date; autore: Persona }[];
  richiestaPreventivo: { stato: StatoRichiestaPreventivo; partner: { nome: string } } | null;
}

export function SegnalazioneDetail({
  segnalazione,
  currentUserId,
  puoModificareStato,
  backHref,
  partnerDisponibili,
}: {
  segnalazione: SegnalazioneDetailData;
  currentUserId: string;
  puoModificareStato: boolean;
  backHref: string;
  partnerDisponibili: { id: string; nome: string; zonaCopertura: string }[];
}) {
  const router = useRouter();
  const [testo, setTesto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [preventivoError, setPreventivoError] = useState<string | null>(null);
  const [isPreventivoPending, startPreventivoTransition] = useTransition();
  const [richiestoAPartnerId, setRichiestoAPartnerId] = useState<string | null>(null);

  useEffect(() => {
    segnaSegnalazioneLettaAction(segnalazione.id);
  }, [segnalazione.id]);

  const isMittente = currentUserId === segnalazione.creatoDaUserId;
  const destinatariAltri = segnalazione.destinatari.filter((d) => d.userId !== segnalazione.creatoDaUserId);

  const richiestaAttiva =
    segnalazione.richiestaPreventivo ??
    (richiestoAPartnerId
      ? { stato: "INVIATA" as StatoRichiestaPreventivo, partner: { nome: partnerDisponibili.find((p) => p.id === richiestoAPartnerId)?.nome ?? "" } }
      : null);

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!testo.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await aggiungiRispostaAction({ segnalazioneId: segnalazione.id, testo });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setTesto("");
      router.refresh();
    });
  }

  function handleRichiediPreventivo(partnerId: string) {
    setPreventivoError(null);
    startPreventivoTransition(async () => {
      const result = await richiediPreventivoAction({ segnalazioneId: segnalazione.id, partnerId });
      if (!result.success) {
        setPreventivoError(result.error);
        return;
      }
      setRichiestoAPartnerId(partnerId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Link href={backHref} className="text-sm text-slate-500 hover:underline">
        &larr; Torna alle segnalazioni
      </Link>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{segnalazione.titolo}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {segnalazione.immobile.indirizzo}, {segnalazione.immobile.comune}
              {segnalazione.immobile.condominio && ` · ${segnalazione.immobile.condominio.nome}`}
            </p>
          </div>
          {puoModificareStato ? (
            <StatoSegnalazioneSelect segnalazioneId={segnalazione.id} statoAttuale={segnalazione.stato} />
          ) : (
            <StatoSegnalazioneBadge stato={segnalazione.stato} label={STATO_SEGNALAZIONE_LABELS[segnalazione.stato]} />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {segnalazione.categoria && <Badge tone="info">{CATEGORIA_SEGNALAZIONE_LABELS[segnalazione.categoria]}</Badge>}
          <Badge tone="neutral">Priorità {segnalazione.priorita}</Badge>
        </div>

        <p className="mt-4 text-sm text-slate-700">{segnalazione.descrizione}</p>

        <p className="mt-4 text-xs text-slate-400">
          Aperta da {segnalazione.creatoDa.nome} {segnalazione.creatoDa.cognome} ({ROLE_LABELS[segnalazione.creatoDa.role] ?? segnalazione.creatoDa.role})
          {" · "}
          {formatDate(segnalazione.createdAt)}
        </p>
      </Card>

      {isMittente && destinatariAltri.length > 0 && (
        <Card>
          <CardHeader title="Destinatari" description="Chi ha ricevuto questa segnalazione" />
          <ul className="divide-y divide-slate-100">
            {destinatariAltri.map((d) => (
              <li key={d.userId} className="flex items-center justify-between gap-4 py-2">
                <span className="text-sm text-slate-700">
                  {d.user.nome} {d.user.cognome} ({ROLE_LABELS[d.user.role] ?? d.user.role})
                </span>
                <Badge tone={d.letto ? "success" : "neutral"}>{d.letto ? "Letto" : "Non letto"}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {segnalazione.categoriaIntervento && (
        <Card>
          <CardHeader
            title="Serve un intervento?"
            description={`Partner convenzionati per: ${CATEGORIA_INTERVENTO_LABELS[segnalazione.categoriaIntervento]}`}
          />
          {richiestaAttiva ? (
            <p className="text-sm text-slate-700">
              Preventivo richiesto a <span className="font-medium">{richiestaAttiva.partner.nome}</span> —{" "}
              {STATO_RICHIESTA_PREVENTIVO_LABELS[richiestaAttiva.stato]}
            </p>
          ) : partnerDisponibili.length === 0 ? (
            <p className="text-sm text-slate-400">Nessun partner convenzionato disponibile al momento per questa categoria.</p>
          ) : (
            <div className="space-y-3">
              {partnerDisponibili.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 rounded-card border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.nome}</p>
                    <p className="text-sm text-slate-500">{p.zonaCopertura}</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isPreventivoPending}
                    onClick={() => handleRichiediPreventivo(p.id)}
                  >
                    Richiedi preventivo
                  </Button>
                </div>
              ))}
              {preventivoError && <p className="text-sm text-red-600">{preventivoError}</p>}
            </div>
          )}
        </Card>
      )}

      <Card>
        <CardHeader title="Conversazione" />
        {segnalazione.risposte.length === 0 ? (
          <p className="py-4 text-sm text-slate-400">Nessuna risposta ancora.</p>
        ) : (
          <ul className="space-y-4">
            {segnalazione.risposte.map((r) => (
              <li key={r.id} className="rounded-card bg-surface-muted p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-900">
                    {r.autore.nome} {r.autore.cognome} ({ROLE_LABELS[r.autore.role] ?? r.autore.role})
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{r.testo}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleReply} className="mt-4 space-y-3">
          <Textarea
            rows={3}
            placeholder="Scrivi una risposta..."
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isPending || !testo.trim()}>
            {isPending ? "Invio in corso..." : "Rispondi"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
