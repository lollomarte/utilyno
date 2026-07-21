import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <nav className="flex gap-1">
          <Link
            href="/admin/giocatori"
            className="px-3 py-1.5 text-sm rounded-full border border-line hover:border-ink"
          >
            Giocatori
          </Link>
          <Link
            href="/admin/partite"
            className="px-3 py-1.5 text-sm rounded-full border border-line hover:border-ink"
          >
            Partite
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm text-muted hover:text-ink">
            Esci
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
