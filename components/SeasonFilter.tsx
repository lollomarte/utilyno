"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function SeasonFilter({ seasons }: { seasons: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("stagione") ?? "";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("stagione", value);
    } else {
      params.delete("stagione");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 border border-line rounded-full px-3 text-sm bg-surface-2 text-ink"
    >
      <option value="">Tutte le stagioni</option>
      {seasons.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
