import { requireAdmin } from "@/lib/auth-helpers";
import { getNoteSviluppatore } from "@/lib/data/note-sviluppatore";
import { NoteSviluppatorePageClient } from "@/components/note-sviluppatore/note-sviluppatore-page-client";

export default async function NoteSviluppatorePage() {
  await requireAdmin();
  const note = await getNoteSviluppatore();

  return <NoteSviluppatorePageClient note={note} />;
}
