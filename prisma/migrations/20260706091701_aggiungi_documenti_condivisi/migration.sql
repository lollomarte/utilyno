-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "caricatoDaUserId" TEXT,
ADD COLUMN     "condominioId" TEXT,
ADD COLUMN     "scadenzaAutoEliminazione" TIMESTAMP(3);

-- Backfill caricatoDaUserId per le righe esistenti: usa lo user dell'agenzia collegata
-- all'immobile (o al contratto), con fallback allo user più vecchio della piattaforma
-- se non risolvibile. Nessuna riga applicativa arriva mai senza uploader da qui in poi:
-- la colonna diventa NOT NULL subito dopo.
UPDATE "Documento" d
SET "caricatoDaUserId" = COALESCE(
  (SELECT a."userId" FROM "Immobile" i JOIN "Agenzia" a ON a.id = i."agenziaId" WHERE i.id = d."immobileId"),
  (SELECT a."userId" FROM "Contratto" c JOIN "Agenzia" a ON a.id = c."agenziaId" WHERE c.id = d."contrattoId"),
  (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1)
)
WHERE d."caricatoDaUserId" IS NULL;

-- AlterTable
ALTER TABLE "Documento" ALTER COLUMN "caricatoDaUserId" SET NOT NULL;

-- CreateTable
CREATE TABLE "DocumentoCondivisione" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ruolo" "Role" NOT NULL,
    "letto" BOOLEAN NOT NULL DEFAULT false,
    "dataLettura" TIMESTAMP(3),
    "scaricato" BOOLEAN NOT NULL DEFAULT false,
    "dataScaricamento" TIMESTAMP(3),

    CONSTRAINT "DocumentoCondivisione_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentoCondivisione_userId_idx" ON "DocumentoCondivisione"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoCondivisione_documentoId_userId_key" ON "DocumentoCondivisione"("documentoId", "userId");

-- CreateIndex
CREATE INDEX "Documento_condominioId_idx" ON "Documento"("condominioId");

-- CreateIndex
CREATE INDEX "Documento_caricatoDaUserId_idx" ON "Documento"("caricatoDaUserId");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_caricatoDaUserId_fkey" FOREIGN KEY ("caricatoDaUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCondivisione" ADD CONSTRAINT "DocumentoCondivisione_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCondivisione" ADD CONSTRAINT "DocumentoCondivisione_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
