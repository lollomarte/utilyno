-- CreateEnum
CREATE TYPE "TipoSoggetto" AS ENUM ('PERSONA_FISICA', 'AZIENDA');

-- CreateEnum
CREATE TYPE "RuoloRelazioneImmobile" AS ENUM ('PROPRIETARIO', 'INQUILINO');

-- CreateEnum
CREATE TYPE "StatoRelazioneImmobile" AS ENUM ('ATTIVA', 'CESSATA', 'IN_ATTESA');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'AGENZIA', 'AMMINISTRATORE', 'PRIVATO');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "DocumentoCondivisione" ALTER COLUMN "ruolo" TYPE "Role_new" USING ("ruolo"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Contratto" DROP CONSTRAINT "Contratto_inquilinoId_fkey";

-- DropForeignKey
ALTER TABLE "Immobile" DROP CONSTRAINT "Immobile_proprietarioId_fkey";

-- DropForeignKey
ALTER TABLE "Inquilino" DROP CONSTRAINT "Inquilino_userId_fkey";

-- DropForeignKey
ALTER TABLE "InvitoInquilino" DROP CONSTRAINT "InvitoInquilino_inquilinoId_fkey";

-- DropForeignKey
ALTER TABLE "Proprietario" DROP CONSTRAINT "Proprietario_userId_fkey";

-- DropForeignKey
ALTER TABLE "RichiestaGestioneImmobile" DROP CONSTRAINT "RichiestaGestioneImmobile_proprietarioId_fkey";

-- DropIndex
DROP INDEX "Immobile_proprietarioId_idx";

-- AlterTable
ALTER TABLE "Contratto" ADD COLUMN     "proprietarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Immobile" DROP COLUMN "proprietarioId";

-- DropTable
DROP TABLE "Inquilino";

-- DropTable
DROP TABLE "Proprietario";

-- CreateTable
CREATE TABLE "Privato" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipoSoggetto" "TipoSoggetto" NOT NULL,
    "codiceFiscale" TEXT,
    "ragioneSociale" TEXT,
    "piva" TEXT,
    "referenteNome" TEXT,
    "referenteRuolo" TEXT,
    "indirizzo" TEXT,
    "iban" TEXT,

    CONSTRAINT "Privato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelazioneImmobilePrivato" (
    "id" TEXT NOT NULL,
    "privatoId" TEXT NOT NULL,
    "immobileId" TEXT NOT NULL,
    "ruolo" "RuoloRelazioneImmobile" NOT NULL,
    "stato" "StatoRelazioneImmobile" NOT NULL DEFAULT 'ATTIVA',
    "contrattoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelazioneImmobilePrivato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Privato_userId_key" ON "Privato"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Privato_codiceFiscale_key" ON "Privato"("codiceFiscale");

-- CreateIndex
CREATE UNIQUE INDEX "Privato_piva_key" ON "Privato"("piva");

-- CreateIndex
CREATE INDEX "RelazioneImmobilePrivato_privatoId_immobileId_ruolo_stato_idx" ON "RelazioneImmobilePrivato"("privatoId", "immobileId", "ruolo", "stato");

-- CreateIndex
CREATE INDEX "Contratto_proprietarioId_idx" ON "Contratto"("proprietarioId");

-- AddForeignKey
ALTER TABLE "Privato" ADD CONSTRAINT "Privato_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelazioneImmobilePrivato" ADD CONSTRAINT "RelazioneImmobilePrivato_privatoId_fkey" FOREIGN KEY ("privatoId") REFERENCES "Privato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelazioneImmobilePrivato" ADD CONSTRAINT "RelazioneImmobilePrivato_immobileId_fkey" FOREIGN KEY ("immobileId") REFERENCES "Immobile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelazioneImmobilePrivato" ADD CONSTRAINT "RelazioneImmobilePrivato_contrattoId_fkey" FOREIGN KEY ("contrattoId") REFERENCES "Contratto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RichiestaGestioneImmobile" ADD CONSTRAINT "RichiestaGestioneImmobile_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Privato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contratto" ADD CONSTRAINT "Contratto_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Privato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contratto" ADD CONSTRAINT "Contratto_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Privato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitoInquilino" ADD CONSTRAINT "InvitoInquilino_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Privato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

