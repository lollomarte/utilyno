"use client";

import { useDemoModal } from "@/components/homepage/demo-provider";

export function DemoTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  const openDemo = useDemoModal();
  return (
    <button type="button" onClick={openDemo} className={className}>
      {children}
    </button>
  );
}
