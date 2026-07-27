"use client";

import { motion } from "framer-motion";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { playerName, ruoloLabel } from "@/lib/format";
import { questionTypeConfig, type QuestionType } from "@/lib/gameQuestions";
import type { GuessGamePlayer } from "@/lib/data/game";

export function GuessGamePlayerCard({
  player,
  revealed,
  questionType,
}: {
  player: GuessGamePlayer;
  revealed: boolean;
  questionType: QuestionType;
}) {
  const question = questionTypeConfig(questionType);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-line-strong bg-surface p-4 sm:p-5 min-w-0"
    >
      <PlayerAvatar player={player} size={72} />
      <div className="text-center min-w-0 w-full">
        <p className="font-display font-bold truncate">{playerName(player)}</p>
        <p className="text-xs text-muted mt-0.5">{player.ruolo ? ruoloLabel[player.ruolo] : "—"}</p>
      </div>
      <div className="h-9 flex items-center justify-center">
        {revealed ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-xl sm:text-2xl font-bold tabular-nums"
          >
            {question.formatValue(question.getValue(player))}
          </motion.p>
        ) : (
          <p className="font-display text-xl sm:text-2xl font-bold tabular-nums text-faint">???</p>
        )}
      </div>
    </motion.div>
  );
}
