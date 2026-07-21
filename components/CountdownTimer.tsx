"use client";

import { useEffect, useState } from "react";
import { nextMondayNight } from "@/lib/season";

function diffParts(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, done: ms <= 0 };
}

export function CountdownTimer() {
  const [target] = useState(() => nextMondayNight());
  const [parts, setParts] = useState(() => diffParts(target));

  useEffect(() => {
    const id = setInterval(() => setParts(diffParts(target)), 30_000);
    return () => clearInterval(id);
  }, [target]);

  if (parts.done) {
    return <p className="text-sm text-accent font-semibold">Si gioca oggi! ⚽</p>;
  }

  return (
    <p className="text-sm text-muted">
      Si gioca tra{" "}
      <span className="text-ink font-semibold tabular-nums">
        {parts.days > 0 && `${parts.days}g `}
        {parts.hours}h {parts.minutes}m
      </span>
    </p>
  );
}
