"use client";

import { deleteMatchAction } from "@/lib/actions/matches";

export function DeleteMatchButton({ matchId }: { matchId: string }) {
  return (
    <form
      action={deleteMatchAction}
      onSubmit={(e) => {
        if (!confirm("Eliminare questa partita? L'operazione non è reversibile.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={matchId} />
      <button type="submit" className="tap text-sm text-red-400 hover:underline">
        Elimina
      </button>
    </form>
  );
}
