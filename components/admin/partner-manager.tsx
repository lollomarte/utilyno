"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePartnerAttivoAction } from "@/app/actions/partner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { PartnerForm, type PartnerEsistente } from "@/components/admin/partner-form";
import { CATEGORIA_INTERVENTO_LABELS } from "@/lib/labels";
import { withTimeout } from "@/lib/utils";

export function PartnerManager({ partner }: { partner: PartnerEsistente[] }) {
  const router = useRouter();
  const [modalAperto, setModalAperto] = useState(false);
  const [partnerInModifica, setPartnerInModifica] = useState<PartnerEsistente | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function apriCreazione() {
    setPartnerInModifica(undefined);
    setModalAperto(true);
  }

  function apriModifica(p: PartnerEsistente) {
    setPartnerInModifica(p);
    setModalAperto(true);
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      try {
        await withTimeout(togglePartnerAttivoAction(id));
        router.refresh();
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={apriCreazione}>Nuovo partner</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nome</TableHeaderCell>
            <TableHeaderCell>Categoria</TableHeaderCell>
            <TableHeaderCell>Zona</TableHeaderCell>
            <TableHeaderCell>Contatto</TableHeaderCell>
            <TableHeaderCell>Stato</TableHeaderCell>
            <TableHeaderCell>{""}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {partner.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.nome}</TableCell>
              <TableCell>{CATEGORIA_INTERVENTO_LABELS[p.categoria]}</TableCell>
              <TableCell>{p.zonaCopertura}</TableCell>
              <TableCell>
                {p.contattoReferente} · {p.telefono}
              </TableCell>
              <TableCell>
                <Badge tone={p.attivo ? "success" : "neutral"}>{p.attivo ? "Attivo" : "Disattivato"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => apriModifica(p)}>
                    Modifica
                  </Button>
                  <Button variant="secondary" disabled={isPending} onClick={() => handleToggle(p.id)}>
                    {p.attivo ? "Disattiva" : "Attiva"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal open={modalAperto} onClose={() => setModalAperto(false)} title={partnerInModifica ? "Modifica partner" : "Nuovo partner"}>
        <PartnerForm partner={partnerInModifica} onSuccess={() => setModalAperto(false)} />
      </Modal>
    </div>
  );
}
