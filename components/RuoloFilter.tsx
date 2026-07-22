"use client";

import type { Ruolo } from "@/lib/types";

export type RuoloFilterValue = "" | Ruolo;

const options: { value: RuoloFilterValue; label: string }[] = [
  { value: "", label: "Tutti i ruoli" },
  { value: "difensore", label: "Difensori" },
  { value: "centrocampista", label: "Centrocampisti" },
  { value: "attaccante", label: "Attaccanti" },
];

export function RuoloFilter({
  value,
  onChange,
}: {
  value: RuoloFilterValue;
  onChange: (value: RuoloFilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((o) => (
        <button
          key={o.value || "tutti"}
          type="button"
          onClick={() => onChange(o.value)}
          className={`tap px-3 py-1.5 text-sm rounded-full border transition-colors ${
            value === o.value
              ? "bg-accent text-[#06210f] border-accent"
              : "border-line text-muted hover:text-ink hover:border-line-strong"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
