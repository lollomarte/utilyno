import { getGuessGamePool } from "@/lib/data/game";
import { GuessGame } from "@/components/game/GuessGame";
import { EmptyState } from "@/components/EmptyState";

export default async function GiocoPage() {
  const pool = await getGuessGamePool();

  if (pool.length < 2) {
    return (
      <EmptyState>
        Servono almeno due giocatori con 5 o più presenze per giocare: tornate quando il gruppo avrà
        macinato qualche partita in più 🎮
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted -mt-2">
        Indovina se il valore di mercato del giocatore a destra è più alto o più basso di quello a
        sinistra. Quante coppie indovini di fila?
      </p>
      <GuessGame pool={pool} />
    </div>
  );
}
