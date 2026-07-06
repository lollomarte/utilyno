"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, EmptyState } from "@/components/ui/table";
import { StatoImmobileBadge, StatoRichiestaGestioneBadge } from "@/components/ui/badge";
import { NuovoImmobileProprietarioForm } from "@/components/immobili/nuovo-immobile-proprietario-form";
import { RichiedeGestioneModal } from "@/components/immobili/richiedi-gestione-modal";
import { formatCurrency } from "@/lib/utils";
import { TIPO_IMMOBILE_LABELS, STATO_IMMOBILE_LABELS } from "@/lib/labels";
import type { StatoImmobile, StatoRichiestaGestione } from "@prisma/client";

export interface ImmobileProprietarioRiga {
  id: string;
  indirizzo: string;
  comune: string;
  tipoImmobile: string;
  valoreStimato: number;
  stato: StatoImmobile;
  contratti: { canoneMensile: number }[];
  richiesteGestione: { stato: StatoRichiestaGestione; agenzia: { ragioneSociale: string } }[];
}

export function ImmobiliProprietarioPageClient({ immobili }: { immobili: ImmobileProprietarioRiga[] }) {
  const [openNuovo, setOpenNuovo] = useState(false);
  const [richiediPerImmobile, setRichiediPerImmobile] = useState<string | null>(null);

  const rendimenti = immobili.map((immobile) => {
    const contrattoAttivo = immobile.contratti[0];
    const yieldLordo =
      contrattoAttivo && immobile.valoreStimato > 0 ? (contrattoAttivo.canoneMensile * 12) / immobile.valoreStimato : null;
    return { immobile, yieldLordo };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Immobili</h1>
          <p className="mt-1 text-sm text-slate-500">Rendimento lordo calcolato su canone annuo e valore stimato</p>
        </div>
        <Button onClick={() => setOpenNuovo(true)} className="shrink-0">
          Aggiungi immobile
        </Button>
      </div>

      <Card className="p-0">
        {immobili.length === 0 ? (
          <EmptyState message="Nessun immobile associato." action={<Button onClick={() => setOpenNuovo(true)}>Aggiungi immobile</Button>} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Indirizzo</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Valore stimato</TableHeaderCell>
                <TableHeaderCell>Yield lordo</TableHeaderCell>
                <TableHeaderCell>Stato</TableHeaderCell>
                <TableHeaderCell>{""}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rendimenti.map(({ immobile, yieldLordo }) => {
                const ultimaRichiesta = immobile.richiesteGestione[0];
                return (
                  <TableRow key={immobile.id}>
                    <TableCell>
                      <Link href={`/proprietario/immobili/${immobile.id}`} className="font-medium text-ink hover:underline">
                        {immobile.indirizzo}, {immobile.comune}
                      </Link>
                    </TableCell>
                    <TableCell>{TIPO_IMMOBILE_LABELS[immobile.tipoImmobile]}</TableCell>
                    <TableCell>{formatCurrency(immobile.valoreStimato)}</TableCell>
                    <TableCell>{yieldLordo !== null ? `${(yieldLordo * 100).toFixed(2)}%` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <StatoImmobileBadge stato={immobile.stato} label={STATO_IMMOBILE_LABELS[immobile.stato]} />
                        {immobile.stato === "BOZZA_PROPRIETARIO" && ultimaRichiesta && (
                          <span className="text-xs text-slate-500">
                            {ultimaRichiesta.agenzia.ragioneSociale}:{" "}
                            <StatoRichiestaGestioneBadge
                              stato={ultimaRichiesta.stato}
                              label={
                                ultimaRichiesta.stato === "IN_ATTESA"
                                  ? "In attesa"
                                  : ultimaRichiesta.stato === "RIFIUTATA"
                                    ? "Rifiutata"
                                    : "Accettata"
                              }
                            />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {immobile.stato === "BOZZA_PROPRIETARIO" && ultimaRichiesta?.stato !== "IN_ATTESA" && (
                        <Button variant="secondary" onClick={() => setRichiediPerImmobile(immobile.id)}>
                          Cerca un&apos;agenzia
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal open={openNuovo} onClose={() => setOpenNuovo(false)} title="Aggiungi immobile">
        <NuovoImmobileProprietarioForm onSuccess={() => setOpenNuovo(false)} />
      </Modal>

      <RichiedeGestioneModal
        immobileId={richiediPerImmobile}
        onClose={() => setRichiediPerImmobile(null)}
      />
    </div>
  );
}
