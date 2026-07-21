"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

const THRESHOLD = 70;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    if (window.scrollY <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY <= 0) {
      setPull(Math.min(delta * 0.5, 100));
    }
  }

  function onTouchEnd() {
    if (pull > THRESHOLD) {
      setRefreshing(true);
      setPull(THRESHOLD);
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setPull(0);
      }, 700);
    } else {
      setPull(0);
    }
    startY.current = null;
  }

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden sm:hidden"
        style={{ height: pull, transition: reduceMotion || refreshing ? undefined : "height 0.15s" }}
      >
        <motion.span
          animate={{ rotate: refreshing && !reduceMotion ? 360 : pull * 3.6 }}
          transition={refreshing ? { repeat: Infinity, duration: 0.7, ease: "linear" } : undefined}
          className="text-accent text-lg"
        >
          ⟳
        </motion.span>
      </div>
      {children}
    </div>
  );
}
