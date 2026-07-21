"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/components/Toast";

const messages: Record<string, string> = {
  "player-saved": "Giocatore salvato",
  "match-saved": "Partita salvata",
  "match-deleted": "Partita eliminata",
};

export function ToastOnQuery() {
  const { push } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = searchParams.get("toast");

  useEffect(() => {
    if (!key) return;
    push(messages[key] ?? key);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
