import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-20">
      <span className="text-6xl" aria-hidden>
        🏟️
      </span>
      <h1 className="font-display text-2xl font-bold">Palla in tribuna</h1>
      <p className="text-sm text-muted max-w-xs">
        Questa pagina è finita fuori dal campo: non esiste, o è stata spostata altrove.
      </p>
      <ButtonLink href="/" className="mt-2">
        Torna alla Home
      </ButtonLink>
    </div>
  );
}
