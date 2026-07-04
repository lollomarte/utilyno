"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, Label } from "@/components/ui/input";
import { CATEGORIA_INTERVENTO_LABELS, STATO_RICHIESTA_PREVENTIVO_LABELS } from "@/lib/labels";

export function RichiesteFiltri({ partner }: { partner: { id: string; nome: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFiltro(chiave: string, valore: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valore) params.set(chiave, valore);
    else params.delete(chiave);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <Label htmlFor="filtro-categoria">Categoria</Label>
        <Select
          id="filtro-categoria"
          defaultValue={searchParams.get("categoria") ?? ""}
          onChange={(e) => setFiltro("categoria", e.target.value)}
        >
          <option value="">Tutte</option>
          {Object.entries(CATEGORIA_INTERVENTO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="filtro-partner">Partner</Label>
        <Select
          id="filtro-partner"
          defaultValue={searchParams.get("partnerId") ?? ""}
          onChange={(e) => setFiltro("partnerId", e.target.value)}
        >
          <option value="">Tutti</option>
          {partner.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="filtro-stato">Stato</Label>
        <Select
          id="filtro-stato"
          defaultValue={searchParams.get("stato") ?? ""}
          onChange={(e) => setFiltro("stato", e.target.value)}
        >
          <option value="">Tutti</option>
          {Object.entries(STATO_RICHIESTA_PREVENTIVO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
