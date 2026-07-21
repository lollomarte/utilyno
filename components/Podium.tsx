"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CountUp } from "@/components/CountUp";
import { playerName } from "@/lib/format";

interface PodiumEntry {
  player_id: string;
  nome: string;
  cognome: string;
  foto_url: string | null;
  gol_totali: number;
}

const order = [2, 1, 3];
const heights: Record<number, string> = { 1: "h-28", 2: "h-20", 3: "h-16" };
const avatarSize: Record<number, number> = { 1: 68, 2: 52, 3: 52 };
const medal: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function Podium({ entries }: { entries: PodiumEntry[] }) {
  const byRank = new Map(entries.map((e, i) => [i + 1, e]));

  return (
    <div className="flex items-end justify-center gap-3">
      {order.map((rank) => {
        const entry = byRank.get(rank);
        if (!entry) return <div key={rank} className="flex-1" />;

        return (
          <motion.div
            key={rank}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank === 1 ? 0 : rank === 2 ? 0.1 : 0.2, duration: 0.4 }}
            className="flex-1 flex flex-col items-center"
          >
            <Link href={`/giocatori/${entry.player_id}`} className="tap flex flex-col items-center gap-1.5">
              <span className="text-lg">{medal[rank]}</span>
              <PlayerAvatar player={entry} size={avatarSize[rank]} rank={rank} />
              <span className="text-xs font-medium text-center leading-tight max-w-[80px] truncate">
                {playerName(entry)}
              </span>
              <span className="font-display font-bold text-accent tabular-nums">
                <CountUp value={entry.gol_totali} />
              </span>
            </Link>
            <div
              className={`mt-2 w-full rounded-t-lg border border-b-0 border-line-strong bg-surface-2 ${heights[rank]}`}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
