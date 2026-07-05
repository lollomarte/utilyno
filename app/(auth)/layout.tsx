import { LoqoSeal } from "@/components/brand/loqo-seal";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden bg-primary p-12 lg:flex bg-ledger-grid">
        <span className="font-display text-xl font-semibold tracking-tight text-white">LOQO</span>
        <div className="animate-fade-in-up">
          <LoqoSeal size={64} color="#ffffff" className="opacity-90" />
          <p className="font-display mt-8 max-w-sm text-2xl leading-snug text-white">
            L&apos;infrastruttura di fiducia per la gestione degli affitti in Italia.
          </p>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} LOQO</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface-muted px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <LoqoSeal size={40} className="mx-auto" />
            <span className="font-display mt-3 block text-3xl font-semibold tracking-tight text-ink">LOQO</span>
            <p className="mt-1 text-sm text-slate-500">Piattaforma di gestione affitti</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
