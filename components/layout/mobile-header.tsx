"use client";

import { usePathname } from "next/navigation";
import { isNavItemActive, type NavItem } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/notifiche/notification-bell";
import type { Notifica } from "@/lib/notifiche/raccogliNotifiche";

/** Header mobile minimale: titolo della sezione corrente + campanella notifiche. */
export function MobileHeader({ navItems, notifiche }: { navItems: NavItem[]; notifiche: Notifica[] }) {
  const pathname = usePathname();
  const rootHref = navItems[0]?.href;
  const active = navItems.find((item) => isNavItemActive(pathname, item, rootHref));

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white pl-4 pr-2 md:hidden">
      <h1 className="text-[17px] font-semibold text-ink">{active?.label ?? "LOQO"}</h1>
      <NotificationBell notifiche={notifiche} />
    </header>
  );
}
