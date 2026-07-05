import Link from "next/link";

export default function TerminiPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-4 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">Termini di servizio</h1>
      <p className="max-w-md text-sm text-slate-500">
        Il testo di questa pagina è in preparazione. Torna a trovarci a breve.
      </p>
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        Torna alla homepage
      </Link>
    </div>
  );
}
