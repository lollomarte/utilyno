"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { ROLE_LABELS, CATEGORIA_DOCUMENTO_LABELS } from "@/lib/labels";
import { withTimeout } from "@/lib/utils";
import type { ContestoDocumento } from "@/lib/documenti/risolviDestinatariDocumento";

export interface ContestoOption {
  tipo: ContestoDocumento["tipo"];
  id: string;
  label: string;
  pool: { userId: string; ruolo: string; nome: string; cognome: string }[];
}

export function NuovoDocumentoForm({ contesti, onSuccess }: { contesti: ContestoOption[]; onSuccess?: () => void }) {
  const router = useRouter();
  const [contestoId, setContestoId] = useState(contesti[0]?.id ?? "");
  const [scadenza, setScadenza] = useState("");
  const [categoria, setCategoria] = useState("");
  const [scadenzaDocumento, setScadenzaDocumento] = useState("");
  const [nota, setNota] = useState("");
  const [destinatari, setDestinatari] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esito, setEsito] = useState<{ nome: string; cognome: string; ruolo: string }[] | null>(null);

  const contesto = contesti.find((c) => c.id === contestoId);

  function toggleDestinatario(userId: string) {
    setDestinatari((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Seleziona un file");
      return;
    }
    if (!contesto) {
      setError("Seleziona a cosa collegare il documento");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contestoTipo", contesto.tipo);
    formData.append("contestoId", contesto.id);
    if (scadenza) formData.append("scadenzaAutoEliminazione", scadenza);
    if (categoria) formData.append("categoria", categoria);
    if (scadenzaDocumento) formData.append("scadenzaDocumento", scadenzaDocumento);
    if (nota) formData.append("nota", nota);
    for (const id of destinatari) formData.append("destinatari", id);

    setIsSubmitting(true);
    try {
      const response = await withTimeout(fetch("/api/documenti/upload", { method: "POST", body: formData }));
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error || "Caricamento non riuscito. Riprova.");
        return;
      }
      setEsito(body.condivisoCon);
      router.refresh();
    } catch {
      setError("Qualcosa è andato storto, riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (esito) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-ink">Documento caricato.</p>
        {esito.length > 0 ? (
          <div className="rounded-control bg-success-soft p-4 text-sm text-slate-700">
            <p className="font-medium">Condiviso con:</p>
            <ul className="mt-1 space-y-0.5">
              {esito.map((d, i) => (
                <li key={i}>
                  {d.nome} {d.cognome} ({d.ruolo})
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Non condiviso con nessuno: il documento resta visibile solo a te.</p>
        )}
        <Button
          type="button"
          onClick={() => {
            setEsito(null);
            onSuccess?.();
          }}
        >
          Chiudi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {contesti.length > 1 && (
        <div>
          <Label htmlFor="contestoId">Collegato a</Label>
          <Select
            id="contestoId"
            value={contestoId}
            onChange={(e) => {
              setContestoId(e.target.value);
              setDestinatari([]);
            }}
          >
            {contesti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="file">File</Label>
        <input
          id="file"
          type="file"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
      </div>
      <CollapsibleSection title="Dati aggiuntivi (opzionali)" description="Utili per lo scadenzario e per ritrovare il documento">
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Non specificata</option>
            {Object.entries(CATEGORIA_DOCUMENTO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="scadenzaDocumento">Scadenza del documento</Label>
          <Input
            id="scadenzaDocumento"
            type="date"
            value={scadenzaDocumento}
            onChange={(e) => setScadenzaDocumento(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">
            Scadenza reale del documento (es. carta d&apos;identità, APE, polizza), per lo scadenzario.
          </p>
        </div>
        <div>
          <Label htmlFor="nota">Nota</Label>
          <Textarea id="nota" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} />
        </div>
      </CollapsibleSection>
      <div>
        <Label htmlFor="scadenza">Eliminazione automatica (opzionale)</Label>
        <Input id="scadenza" type="date" value={scadenza} onChange={(e) => setScadenza(e.target.value)} />
        <p className="mt-1 text-xs text-slate-400">
          Se impostata, il documento (e il file) verrà eliminato automaticamente dopo questa data.
        </p>
      </div>
      <div>
        <Label htmlFor="destinatari-group">Condividi con</Label>
        {!contesto || contesto.pool.length === 0 ? (
          <p className="text-sm text-slate-500">Nessun&apos;altra parte collegata: il documento resterà visibile solo a te.</p>
        ) : (
          <div id="destinatari-group" className="space-y-2">
            {contesto.pool.map((p) => (
              <label key={p.userId} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={destinatari.includes(p.userId)}
                  onChange={() => toggleDestinatario(p.userId)}
                />
                {p.nome} {p.cognome} ({ROLE_LABELS[p.ruolo] ?? p.ruolo})
              </label>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={isSubmitting || !contestoId}>
        {isSubmitting ? "Caricamento in corso..." : "Carica documento"}
      </Button>
    </form>
  );
}
