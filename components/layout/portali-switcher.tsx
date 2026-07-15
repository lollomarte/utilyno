"use client";

import { useRouter, usePathname } from "next/navigation";
import { Select } from "@/components/ui/input";

export type PortaleVoce = { href: string; label: string };

/** Selettore portale nell'header, visibile solo a chi possiede più di un profilo (es.
 * Proprietario di un immobile e Inquilino di un altro): riusa il componente Select esistente,
 * nessun pattern visivo nuovo introdotto. */
export function PortaliSwitcher({ voci }: { voci: PortaleVoce[] }) {
  const router = useRouter();
  const pathname = usePathname();

  if (voci.length < 2) return null;

  const attuale = voci.find((v) => pathname.startsWith(v.href))?.href ?? voci[0].href;

  return (
    <Select
      aria-label="Cambia portale"
      className="min-h-0 w-auto max-w-[200px] py-1.5 text-sm"
      value={attuale}
      onChange={(e) => router.push(e.target.value)}
    >
      {voci.map((v) => (
        <option key={v.href} value={v.href}>
          {v.label}
        </option>
      ))}
    </Select>
  );
}
