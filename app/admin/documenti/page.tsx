import { requireAdmin } from "@/lib/auth-helpers";
import { getTuttiIDocumenti } from "@/lib/data/documenti";
import { DocumentiPageClient } from "@/components/documenti/documenti-page-client";

export default async function AdminDocumentiPage() {
  await requireAdmin();
  const documenti = await getTuttiIDocumenti();

  return (
    <DocumentiPageClient
      title="Documenti"
      description="Tutti i documenti caricati sulla piattaforma, per finalità di audit"
      documenti={documenti}
    />
  );
}
