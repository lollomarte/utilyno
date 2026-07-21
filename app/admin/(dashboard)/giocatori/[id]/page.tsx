import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/data/players";
import { PlayerForm } from "@/components/admin/PlayerForm";

export default async function ModificaGiocatorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);
  if (!player) notFound();

  return (
    <div>
      <h1 className="font-display text-xl font-bold mb-4">Modifica giocatore</h1>
      <PlayerForm player={player} />
    </div>
  );
}
