"use client";

import { useEffect, useState } from "react";
import { Confetti } from "@/components/Confetti";

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
