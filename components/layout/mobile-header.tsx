export function MobileHeader({ portalLabel, onMenuOpen }: { portalLabel: string; onMenuOpen: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Apri menu di navigazione"
        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold tracking-tight text-slate-900">LOQO</span>
        <span className="text-xs text-slate-500">{portalLabel}</span>
      </div>
    </header>
  );
}
