"use client";

import { useEffect, useRef, useState } from "react";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Il momento "wow" dell'hero: mostra la feature più distintiva di LOQO —
 * una segnalazione che si instrada da sola verso i destinatari giusti —
 * invece di uno screenshot statico. Il disegno richiama un pannello
 * citofono (il concept del redesign): il pulsante in alto "chiama", le
 * linee si accendono in ottone verso i due destinatari quando la sezione
 * entra in viewport. Si anima una sola volta, non in loop.
 */
export function SegnalazioneDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("segnalazione-demo", active && "segnalazione-demo--active")} aria-hidden="true">
      <div className="segnalazione-demo__ticket">
        <Wrench className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        <span>Nuova segnalazione — Perdita in bagno</span>
      </div>

      <svg viewBox="0 0 300 84" className="segnalazione-demo__lines" preserveAspectRatio="none">
        <path className="segnalazione-demo__path segnalazione-demo__path--a" d="M150 0 C 150 36, 70 36, 70 76" />
        <path className="segnalazione-demo__path segnalazione-demo__path--b" d="M150 0 C 150 36, 230 36, 230 76" />
      </svg>

      <div className="segnalazione-demo__destinatari">
        <span className="segnalazione-demo__badge segnalazione-demo__badge--a">Proprietario</span>
        <span className="segnalazione-demo__badge segnalazione-demo__badge--b">Inquilino</span>
      </div>
    </div>
  );
}
