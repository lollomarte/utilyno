-- CreateEnum
CREATE TYPE "CategoriaIntervento" AS ENUM ('IDRAULICO', 'ELETTRICISTA', 'CALDAIA_CLIMATIZZAZIONE', 'MANUTENZIONE_GENERICA', 'UTENZE_LUCE_GAS', 'ASSICURAZIONE', 'ALTRO');

-- CreateEnum
CREATE TYPE "StatoRichiestaPreventivo" AS ENUM ('INVIATA', 'CONTATTATO', 'PREVENTIVO_RICEVUTO', 'CHIUSA_CONVERTITA', 'CHIUSA_NON_CONVERTITA');

-- AlterTable
ALTER TABLE "Segnalazione" ADD COLUMN     "categoriaIntervento" "CategoriaIntervento";

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaIntervento" NOT NULL,
    "zonaCopertura" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contattoReferente" TEXT NOT NULL,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "commissioneMedia" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RichiestaPreventivo" (
    "id" TEXT NOT NULL,
    "segnalazioneId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "richiedenteUserId" TEXT NOT NULL,
    "stato" "StatoRichiestaPreventivo" NOT NULL DEFAULT 'INVIATA',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RichiestaPreventivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RichiestaPreventivo_segnalazioneId_key" ON "RichiestaPreventivo"("segnalazioneId");

-- AddForeignKey
ALTER TABLE "RichiestaPreventivo" ADD CONSTRAINT "RichiestaPreventivo_segnalazioneId_fkey" FOREIGN KEY ("segnalazioneId") REFERENCES "Segnalazione"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RichiestaPreventivo" ADD CONSTRAINT "RichiestaPreventivo_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RichiestaPreventivo" ADD CONSTRAINT "RichiestaPreventivo_richiedenteUserId_fkey" FOREIGN KEY ("richiedenteUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
