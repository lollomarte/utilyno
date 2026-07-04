import Link from "next/link";

export function SegnalazioniNonLetteBadge({ count, href }: { count: number; href: string }) {
  if (count === 0) return null;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-control bg-info/10 px-3 py-2 text-sm font-medium text-info hover:bg-info/20"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info text-xs font-semibold text-white">
        {count}
      </span>
      {count === 1 ? "segnalazione con novità da leggere" : "segnalazioni con novità da leggere"}
    </Link>
  );
}
