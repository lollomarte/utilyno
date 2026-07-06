"use client";

import { usePathname } from "next/navigation";

/** Cross-fade rapido tra le route interne (tier "transizione", 300ms): il
 * remount via key riusa lo stesso trucco del cross-fade dei tab homepage. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
