import { formatDecimal, formatMarketValue } from "@/lib/format";
import type { GuessGamePlayer } from "@/lib/data/game";

export type QuestionType = "valore" | "presenze" | "gol" | "winPct" | "mediaGol";

export interface QuestionTypeConfig {
  type: QuestionType;
  icon: string;
  title: string;
  getValue: (p: GuessGamePlayer) => number;
  formatValue: (v: number) => string;
}

export const QUESTION_TYPES: QuestionTypeConfig[] = [
  {
    type: "valore",
    icon: "💰",
    title: "Chi vale di più tra i due?",
    getValue: (p) => p.valore,
    formatValue: formatMarketValue,
  },
  {
    type: "presenze",
    icon: "📅",
    title: "Chi ha più presenze tra i due?",
    getValue: (p) => p.presenze,
    formatValue: (v) => String(v),
  },
  {
    type: "gol",
    icon: "⚽",
    title: "Chi ha segnato più gol tra i due?",
    getValue: (p) => p.golTotali,
    formatValue: (v) => String(v),
  },
  {
    type: "winPct",
    icon: "🏆",
    title: "Chi ha la percentuale di vittorie più alta tra i due?",
    getValue: (p) => p.percentualeVittorie,
    formatValue: (v) => `${formatDecimal(v, 1)}%`,
  },
  {
    type: "mediaGol",
    icon: "📊",
    title: "Chi ha la media gol più alta tra i due?",
    getValue: (p) => p.mediaGol,
    formatValue: (v) => formatDecimal(v, 2),
  },
];

const BY_TYPE = new Map(QUESTION_TYPES.map((q) => [q.type, q]));

export function questionTypeConfig(type: QuestionType): QuestionTypeConfig {
  return BY_TYPE.get(type)!;
}

export function pickRandomQuestionType(): QuestionType {
  return QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)].type;
}
