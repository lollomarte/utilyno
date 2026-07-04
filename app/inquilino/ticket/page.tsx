import { requireInquilino } from "@/lib/auth-helpers";
import { getTicketForInquilino } from "@/lib/data/inquilino";
import { TicketPageClient } from "@/components/inquilino/ticket-page-client";

export default async function TicketPage() {
  const { inquilino } = await requireInquilino();
  const ticket = await getTicketForInquilino(inquilino.id);

  return <TicketPageClient ticket={ticket} />;
}
