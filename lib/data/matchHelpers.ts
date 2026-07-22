import type { ParticipantWithPlayer } from "@/lib/data/matches";

export function topScorersOf(participants: ParticipantWithPlayer[]): ParticipantWithPlayer[] {
  const max = Math.max(0, ...participants.map((p) => p.gol));
  if (max === 0) return [];
  return participants.filter((p) => p.gol === max);
}

export function topNScorersOf(participants: ParticipantWithPlayer[], n = 3): ParticipantWithPlayer[] {
  return [...participants]
    .filter((p) => p.gol > 0)
    .sort((a, b) => b.gol - a.gol)
    .slice(0, n);
}
