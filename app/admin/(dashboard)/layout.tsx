import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="font-display font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          Admin
        </Link>
        <nav className="flex gap-1">
          <Link
            href="/admin/giocatori"
            className="tap px-3 py-1.5 text-sm rounded-full border border-line hover:border-line-strong"
          >
            Giocatori
          </Link>
          <Link
            href="/admin/partite"
            className="tap px-3 py-1.5 text-sm rounded-full border border-line hover:border-line-strong"
          >
            Partite
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="tap text-sm text-muted hover:text-ink">
            Esci
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
