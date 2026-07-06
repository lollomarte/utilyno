-- CreateEnum
CREATE TYPE "StatoImmobile" AS ENUM ('BOZZA_PROPRIETARIO', 'IN_GESTIONE_AGENZIA', 'ATTIVO');

-- CreateEnum
CREATE TYPE "StatoRichiestaGestione" AS ENUM ('IN_ATTESA', 'ACCETTATA', 'RIFIUTATA');

-- AlterTable
ALTER TABLE "Immobile" ADD COLUMN     "stato" "StatoImmobile" NOT NULL DEFAULT 'BOZZA_PROPRIETARIO',
ALTER COLUMN "agenziaId" DROP NOT NULL;

-- Le righe esistenti sono tutte nate dal flusso Agenzia/Amministratore (agenziaId già
-- obbligatorio finora): il nuovo default BOZZA_PROPRIETARIO vale solo per gli immobili
-- auto-inseriti dal Proprietario da qui in avanti, non per lo storico.
UPDATE "Immobile" SET "stato" = 'ATTIVO' WHERE "agenziaId" IS NOT NULL;

-- CreateTable
CREATE TABLE "RichiestaGestioneImmobile" (
    "id" TEXT NOT NULL,
    "immobileId" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "agenziaId" TEXT NOT NULL,
    "stato" "StatoRichiestaGestione" NOT NULL DEFAULT 'IN_ATTESA',
    "messaggio" TEXT,
    "dataRichiesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRisposta" TIMESTAMP(3),

    CONSTRAINT "RichiestaGestioneImmobile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RichiestaGestioneImmobile_immobileId_idx" ON "RichiestaGestioneImmobile"("immobileId");

-- CreateIndex
CREATE INDEX "RichiestaGestioneImmobile_proprietarioId_idx" ON "RichiestaGestioneImmobile"("proprietarioId");

-- CreateIndex
CREATE INDEX "RichiestaGestioneImmobile_agenziaId_idx" ON "RichiestaGestioneImmobile"("agenziaId");

-- CreateIndex
CREATE INDEX "RichiestaGestioneImmobile_stato_idx" ON "RichiestaGestioneImmobile"("stato");

-- CreateIndex
CREATE INDEX "Immobile_stato_idx" ON "Immobile"("stato");

-- AddForeignKey
ALTER TABLE "RichiestaGestioneImmobile" ADD CONSTRAINT "RichiestaGestioneImmobile_immobileId_fkey" FOREIGN KEY ("immobileId") REFERENCES "Immobile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RichiestaGestioneImmobile" ADD CONSTRAINT "RichiestaGestioneImmobile_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RichiestaGestioneImmobile" ADD CONSTRAINT "RichiestaGestioneImmobile_agenziaId_fkey" FOREIGN KEY ("agenziaId") REFERENCES "Agenzia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
