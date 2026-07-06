"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cercaAgenzieAction, richiediGestioneImmobileAction, type AgenziaRisultatoRicerca } from "@/app/actions/immobili";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withTimeout } from "@/lib/utils";

export function RichiediGestioneForm({ immobileId, onSuccess }: { immobileId: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [isSearching, startSearch] = useTransition();
  const [query, setQuery] = useState("");
  const [risultati, setRisultati] = useState<AgenziaRisultatoRicerca[]>([]);
  const [cercato, setCercato] = useState(false);
  const [selezionata, setSelezionata] = useState<AgenziaRisultatoRicerca | null>(null);
  const [messaggio, setMessaggio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviata, setInviata] = useState(false);

  function handleCerca(e: React.FormEvent) {
    e.preventDefault();
    setSelezionata(null);
    startSearch(async () => {
      const risultato = await withTimeout(cercaAgenzieAction(query));
      setRisultati(risultato);
      setCercato(true);
    });
  }

  async function handleInvia() {
    if (!selezionata) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await withTimeout(
        richiediGestioneImmobileAction({ immobileId, agenziaId: selezionata.id, messaggio: messaggio || undefined })
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setInviata(true);
      router.refresh();
    } catch {
      setError("Qualcosa è andato storto, riprova.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (inviata) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-ink">
          Richiesta inviata a {selezionata?.ragioneSociale}. Ti avviseremo quando risponderà.
        </p>
        <Button type="button" onClick={onSuccess}>
          Chiudi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCerca} className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="query">Cerca agenzia (nome o email)</Label>
          <Input id="query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Es. Milano Casa Immobiliare" />
        </div>
        <Button type="submit" variant="secondary" disabled={isSearching || !query.trim()}>
          {isSearching ? "Cerco..." : "Cerca"}
        </Button>
      </form>

      {cercato && (
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {risultati.length === 0 ? (
            <p className="text-sm text-slate-500">Nessuna agenzia trovata con questo nome o email.</p>
          ) : (
            risultati.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelezionata(a)}
                className={`block w-full rounded-control px-3 py-2 text-left text-sm ring-1 ring-inset transition-colors ${
                  selezionata?.id === a.id ? "bg-primary/5 ring-primary" : "ring-slate-200 hover:bg-surface-muted"
                }`}
              >
                <span className="font-medium text-ink">{a.ragioneSociale}</span>
                <span className="ml-2 text-slate-500">{a.email}</span>
              </button>
            ))
          )}
        </div>
      )}

      {selezionata && (
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <div>
            <Label htmlFor="messaggio">Messaggio per l&apos;agenzia (opzionale)</Label>
            <Textarea
              id="messaggio"
              rows={3}
              value={messaggio}
              onChange={(e) => setMessaggio(e.target.value)}
              placeholder="Es. Vorrei mettere a rendita questo immobile, contattatemi per i dettagli."
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="button" onClick={handleInvia} disabled={isSubmitting}>
            {isSubmitting ? "Invio in corso..." : `Invia richiesta a ${selezionata.ragioneSociale}`}
          </Button>
        </div>
      )}
    </div>
  );
}
