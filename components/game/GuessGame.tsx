"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { GuessGamePlayerCard } from "@/components/game/GuessGamePlayerCard";
import { CountUp } from "@/components/CountUp";
import { submitGuessGameScore } from "@/lib/actions/game";
import { pickRandomQuestionType, questionTypeConfig, type QuestionType } from "@/lib/gameQuestions";
import type { GuessGamePlayer } from "@/lib/data/game";

const REVEAL_DELAY_MS = 900;
const MAX_NICKNAME_LENGTH = 24;

function pickRandom(pool: GuessGamePlayer[], excludeId?: string): GuessGamePlayer {
  const options = excludeId ? pool.filter((p) => p.id !== excludeId) : pool;
  return options[Math.floor(Math.random() * options.length)];
}

type Phase = "intro" | "playing" | "gameover";
type Direction = "alto" | "basso";

export function GuessGame({ pool }: { pool: GuessGamePlayer[] }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [nickname, setNickname] = useState("");
  const [left, setLeft] = useState<GuessGamePlayer | null>(null);
  const [right, setRight] = useState<GuessGamePlayer | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>("valore");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function startGame() {
    const a = pickRandom(pool);
    const b = pickRandom(pool, a.id);
    setLeft(a);
    setRight(b);
    setQuestionType(pickRandomQuestionType());
    setRevealed(false);
    setScore(0);
    setSubmitError(null);
    setBusy(false);
    setPhase("playing");
  }

  function handleGuess(direction: Direction) {
    if (!left || !right || busy) return;
    setBusy(true);
    const getValue = questionTypeConfig(questionType).getValue;
    const correct = direction === "alto" ? getValue(right) >= getValue(left) : getValue(right) <= getValue(left);
    setRevealed(true);

    if (correct) {
      setTimeout(() => {
        const newLeft = right;
        const newRight = pickRandom(pool, newLeft.id);
        setScore((s) => s + 1);
        setLeft(newLeft);
        setRight(newRight);
        setQuestionType(pickRandomQuestionType());
        setRevealed(false);
        setBusy(false);
      }, REVEAL_DELAY_MS);
    } else {
      setTimeout(() => {
        setPhase("gameover");
        void saveScore();
      }, REVEAL_DELAY_MS);
    }
  }

  async function saveScore() {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    const result = await submitGuessGameScore(trimmed, score);
    if (result.error) setSubmitError(result.error);
  }

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line-strong bg-surface p-8 text-center">
        <p className="text-sm text-muted max-w-xs">
          Inserisci un nickname per salvare il tuo record in classifica, poi inizia a indovinare.
        </p>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, MAX_NICKNAME_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && nickname.trim()) startGame();
          }}
          placeholder="Il tuo nickname"
          maxLength={MAX_NICKNAME_LENGTH}
          className="w-full max-w-xs border border-line bg-surface-2 rounded-md px-3 py-2.5 text-sm text-center focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={startGame}
          disabled={!nickname.trim()}
          className="tap w-full max-w-xs min-h-11 rounded-full bg-accent text-on-accent font-semibold text-sm disabled:opacity-50 disabled:pointer-events-none hover:bg-accent-bright transition-colors"
        >
          Inizia a giocare
        </button>
      </div>
    );
  }

  if (!left || !right) return null;

  const question = questionTypeConfig(questionType);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-muted">
          Punteggio{" "}
          <CountUp value={score} className="text-accent text-lg align-middle ml-1" duration={0.4} />
        </span>
        <div className="flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-4 py-2 max-w-full">
          <span className="text-lg shrink-0" aria-hidden>
            {question.icon}
          </span>
          <span className="font-display text-sm sm:text-base font-bold text-center">{question.title}</span>
        </div>
      </div>

      <div className="relative grid grid-cols-2 items-stretch gap-3 sm:gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {[left, right].map((p, i) => (
            <GuessGamePlayerCard
              key={p.id}
              player={p}
              revealed={i === 0 ? true : revealed}
              questionType={questionType}
            />
          ))}
        </AnimatePresence>

        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 font-display text-sm font-bold text-muted bg-bg border border-line-strong rounded-full w-9 h-9 flex items-center justify-center"
          aria-hidden
        >
          VS
        </span>
      </div>

      {phase === "playing" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleGuess("alto")}
            disabled={busy}
            className="tap min-h-16 rounded-2xl bg-win text-on-accent font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none hover:opacity-90 transition-opacity"
          >
            ▲ Più Alto
          </button>
          <button
            type="button"
            onClick={() => handleGuess("basso")}
            disabled={busy}
            className="tap min-h-16 rounded-2xl bg-loss text-on-accent font-display text-base sm:text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none hover:opacity-90 transition-opacity"
          >
            ▼ Più Basso
          </button>
        </div>
      )}

      {phase === "gameover" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line-strong bg-surface p-6 text-center">
          <p className="font-display text-xl font-bold">Game Over</p>
          <p className="text-sm text-muted">
            Hai indovinato <span className="text-ink font-semibold">{score}</span> coppie di fila.
          </p>
          {submitError && <p className="text-xs text-loss">{submitError}</p>}
          <button
            type="button"
            onClick={startGame}
            className="tap w-full max-w-xs min-h-11 rounded-full bg-accent text-on-accent font-semibold text-sm hover:bg-accent-bright transition-colors"
          >
            Rigioca
          </button>
        </div>
      )}
    </div>
  );
}
