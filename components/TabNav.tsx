"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function TabNav({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 mb-6 overflow-x-auto border-b border-line relative">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
            {active && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
