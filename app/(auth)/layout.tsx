export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold tracking-tight text-slate-900">WERENT</span>
          <p className="mt-1 text-sm text-slate-500">Piattaforma di gestione affitti</p>
        </div>
        {children}
      </div>
    </div>
  );
}
