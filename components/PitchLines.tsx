/** Cerchio di centrocampo e linea mediana stilizzati, decorazione delle hero
 * (Home, Profilo, H2H): bianco al 2-3% di opacità, mai rumore visivo. */
export function PitchLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03]" aria-hidden>
      <div className="absolute left-1/2 top-1/2 w-44 h-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-ink -translate-x-1/2" />
    </div>
  );
}
