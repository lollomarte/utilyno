"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Caricato solo quando serve davvero (partite con scarto ≥5 gol): evita di
// spedire il codice dei coriandoli a ogni visita di una partita "normale".
const Confetti = dynamic(() => import("@/components/Confetti").then((m) => m.Confetti), {
  ssr: false,
});

export function MatchConfettiTrigger({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;
    const id = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(id);
  }, [show]);

  if (!visible) return null;
  return <Confetti />;
}
