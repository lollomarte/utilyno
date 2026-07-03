-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENZIA', 'PROPRIETARIO', 'INQUILINO');

-- CreateEnum
CREATE TYPE "TipoImmobile" AS ENUM ('RESIDENZIALE', 'COMMERCIALE');

-- CreateEnum
CREATE TYPE "TipoContratto" AS ENUM ('QUATTRO_PIU_QUATTRO', 'TRE_PIU_DUE', 'TRANSITORIO', 'STUDENTI', 'CONCORDATO');

-- CreateEnum
CREATE TYPE "RegimeFiscale" AS ENUM ('CEDOLARE_SECCA', 'ORDINARIO');

-- CreateEnum
CREATE TYPE "StatoContratto" AS ENUM ('BOZZA', 'ATTIVO', 'SCADUTO', 'RISOLTO');

-- CreateEnum
CREATE TYPE "StatoPagamento" AS ENUM ('PROGRAMMATO', 'PAGATO', 'IN_RITARDO', 'INSOLUTO');

-- CreateEnum
CREATE TYPE "TipoUtenza" AS ENUM ('LUCE', 'GAS', 'ACQUA', 'INTERNET');

-- CreateEnum
CREATE TYPE "StatoUtenza" AS ENUM ('DA_ATTIVARE', 'ATTIVA', 'DISDETTA');

-- CreateEnum
CREATE TYPE "StatoTicket" AS ENUM ('APERTO', 'IN_LAVORAZIONE', 'RISOLTO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenzia" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ragioneSociale" TEXT NOT NULL,
    "piva" TEXT NOT NULL,
    "indirizzo" TEXT NOT NULL,
    "telefono" TEXT,

    CONSTRAINT "Agenzia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proprietario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codiceFiscale" TEXT NOT NULL,
    "indirizzo" TEXT NOT NULL,

    CONSTRAINT "Proprietario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquilino" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codiceFiscale" TEXT NOT NULL,

    CONSTRAINT "Inquilino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Immobile" (
    "id" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "agenziaId" TEXT NOT NULL,
    "indirizzo" TEXT NOT NULL,
    "comune" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "datiCatastali" TEXT NOT NULL,
    "superficieMq" DOUBLE PRECISION NOT NULL,
    "tipoImmobile" "TipoImmobile" NOT NULL,
    "apeClasse" TEXT,
    "valoreStimato" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Immobile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contratto" (
    "id" TEXT NOT NULL,
    "immobileId" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "agenziaId" TEXT NOT NULL,
    "tipoContratto" "TipoContratto" NOT NULL,
    "dataInizio" TIMESTAMP(3) NOT NULL,
    "dataFine" TIMESTAMP(3) NOT NULL,
    "canoneMensile" DOUBLE PRECISION NOT NULL,
    "regimeFiscale" "RegimeFiscale" NOT NULL,
    "stato" "StatoContratto" NOT NULL DEFAULT 'BOZZA',
    "dataRegistrazioneAdE" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contratto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "contrattoId" TEXT NOT NULL,
    "importo" DOUBLE PRECISION NOT NULL,
    "dataScadenza" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "stato" "StatoPagamento" NOT NULL DEFAULT 'PROGRAMMATO',
    "metodoPagamento" TEXT,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utenza" (
    "id" TEXT NOT NULL,
    "immobileId" TEXT NOT NULL,
    "tipo" "TipoUtenza" NOT NULL,
    "fornitore" TEXT NOT NULL,
    "stato" "StatoUtenza" NOT NULL DEFAULT 'DA_ATTIVARE',
    "dataAttivazione" TIMESTAMP(3),

    CONSTRAINT "Utenza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "immobileId" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "stato" "StatoTicket" NOT NULL DEFAULT 'APERTO',
    "priorita" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "contrattoId" TEXT,
    "immobileId" TEXT,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agenzia_userId_key" ON "Agenzia"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Agenzia_piva_key" ON "Agenzia"("piva");

-- CreateIndex
CREATE UNIQUE INDEX "Proprietario_userId_key" ON "Proprietario"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Proprietario_codiceFiscale_key" ON "Proprietario"("codiceFiscale");

-- CreateIndex
CREATE UNIQUE INDEX "Inquilino_userId_key" ON "Inquilino"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Inquilino_codiceFiscale_key" ON "Inquilino"("codiceFiscale");

-- AddForeignKey
ALTER TABLE "Agenzia" ADD CONSTRAINT "Agenzia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proprietario" ADD CONSTRAINT "Proprietario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquilino" ADD CONSTRAINT "Inquilino_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immobile" ADD CONSTRAINT "Immobile_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immobile" ADD CONSTRAINT "Immobile_agenziaId_fkey" FOREIGN KEY ("agenziaId") REFERENCES "Agenzia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contratto" ADD CONSTRAINT "Contratto_immobileId_fkey" FOREIGN KEY ("immobileId") REFERENCES "Immobile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contratto" ADD CONSTRAINT "Contratto_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contratto" ADD CONSTRAINT "Contratto_agenziaId_fkey" FOREIGN KEY ("agenziaId") REFERENCES "Agenzia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_contrattoId_fkey" FOREIGN KEY ("contrattoId") REFERENCES "Contratto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utenza" ADD CONSTRAINT "Utenza_immobileId_fkey" FOREIGN KEY ("immobileId") REFERENCES "Immobile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_immobileId_fkey" FOREIGN KEY ("immobileId") REFERENCES "Immobile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_contrattoId_fkey" FOREIGN KEY ("contrattoId") REFERENCES "Contratto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_immobileId_fkey" FOREIGN KEY ("immobileId") REFERENCES "Immobile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
