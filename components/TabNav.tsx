"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabNav({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 mb-6 overflow-x-auto border-b border-line">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
