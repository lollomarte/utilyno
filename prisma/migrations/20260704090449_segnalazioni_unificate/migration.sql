-- Estensione per generare id opachi per le nuove righe (già supportata da Neon).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateEnum
CREATE TYPE "CategoriaSegnalazione" AS ENUM ('PROBLEMA_UNITA', 'PROBLEMA_CONDOMINIALE', 'PROBLEMA_MISTO', 'PROBLEMA_CONTRATTUALE');

-- CreateTable
CREATE TABLE "Segnalazione" (
    "id" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "categoria" "CategoriaSegnalazione",
    "priorita" TEXT NOT NULL,
    "stato" "StatoSegnalazione" NOT NULL DEFAULT 'APERTA',
    "creatoDaUserId" TEXT NOT NULL,
    "immobileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Segnalazione_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SegnalazioneDestinatario" (
    "id" TEXT NOT NULL,
    "segnalazioneId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "letto" BOOLEAN NOT NULL DEFAULT false,
    "dataLettura" TIMESTAMP(3),

    CONSTRAINT "SegnalazioneDestinatario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SegnalazioneRisposta" (
    "id" TEXT NOT NULL,
    "segnalazioneId" TEXT NOT NULL,
    "autoreUserId" TEXT NOT NULL,
    "testo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SegnalazioneRisposta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SegnalazioneDestinatario_segnalazioneId_userId_key" ON "SegnalazioneDestinatario"("segnalazioneId", "userId");

-- ============================================================
-- Migrazione dati: SegnalazioneCondominiale -> Segnalazione
-- Riusiamo l'id originale come nuovo id (la vecchia tabella viene
-- droppata subito dopo, nessun rischio di collisione).
-- Le righe "generali" (immobileId nullo) vengono ancorate al primo
-- immobile del condominio in ordine di id, per non perdere lo storico:
-- il nuovo modello richiede sempre un immobileId.
-- ============================================================
INSERT INTO "Segnalazione" ("id", "titolo", "descrizione", "priorita", "stato", "creatoDaUserId", "immobileId", "createdAt")
SELECT
  sc.id,
  sc.titolo,
  sc.descrizione,
  sc.priorita,
  sc.stato,
  a."userId",
  COALESCE(sc."immobileId", (SELECT i.id FROM "Immobile" i WHERE i."condominioId" = sc."condominioId" ORDER BY i.id LIMIT 1)),
  sc."createdAt"
FROM "SegnalazioneCondominiale" sc
JOIN "Condominio" c ON c.id = sc."condominioId"
JOIN "Amministratore" a ON a.id = c."amministratoreId"
WHERE COALESCE(sc."immobileId", (SELECT i.id FROM "Immobile" i WHERE i."condominioId" = sc."condominioId" ORDER BY i.id LIMIT 1)) IS NOT NULL;

-- Destinatario: l'amministratore stesso (creatore, già "letto")
INSERT INTO "SegnalazioneDestinatario" ("id", "segnalazioneId", "userId", "letto", "dataLettura")
SELECT gen_random_uuid()::text, s.id, s."creatoDaUserId", true, s."createdAt"
FROM "Segnalazione" s
JOIN "SegnalazioneCondominiale" sc ON sc.id = s.id;

-- Destinatario: proprietario, se il vecchio flag notificaProprietario era true
INSERT INTO "SegnalazioneDestinatario" ("id", "segnalazioneId", "userId", "letto")
SELECT gen_random_uuid()::text, s.id, p."userId", false
FROM "Segnalazione" s
JOIN "SegnalazioneCondominiale" sc ON sc.id = s.id
JOIN "Immobile" i ON i.id = s."immobileId"
JOIN "Proprietario" p ON p.id = i."proprietarioId"
WHERE sc."notificaProprietario" = true;

-- Destinatario: inquilino con contratto attivo sull'immobile, se notificaInquilino era true
INSERT INTO "SegnalazioneDestinatario" ("id", "segnalazioneId", "userId", "letto")
SELECT gen_random_uuid()::text, s.id, inq."userId", false
FROM "Segnalazione" s
JOIN "SegnalazioneCondominiale" sc ON sc.id = s.id
JOIN "Contratto" ct ON ct."immobileId" = s."immobileId" AND ct.stato = 'ATTIVO'
JOIN "Inquilino" inq ON inq.id = ct."inquilinoId"
WHERE sc."notificaInquilino" = true;

-- ============================================================
-- Migrazione dati: Ticket -> Segnalazione
-- Visibilità implicita del vecchio modello: inquilino (creatore) + proprietario.
-- ============================================================
INSERT INTO "Segnalazione" ("id", "titolo", "descrizione", "priorita", "stato", "creatoDaUserId", "immobileId", "createdAt")
SELECT
  t.id,
  t.titolo,
  t.descrizione,
  t.priorita,
  (CASE t.stato
    WHEN 'APERTO' THEN 'APERTA'
    WHEN 'IN_LAVORAZIONE' THEN 'IN_LAVORAZIONE'
    WHEN 'RISOLTO' THEN 'RISOLTA'
  END)::"StatoSegnalazione",
  inq."userId",
  t."immobileId",
  t."createdAt"
FROM "Ticket" t
JOIN "Inquilino" inq ON inq.id = t."inquilinoId";

-- Destinatario: l'inquilino stesso (creatore, già "letto")
INSERT INTO "SegnalazioneDestinatario" ("id", "segnalazioneId", "userId", "letto", "dataLettura")
SELECT gen_random_uuid()::text, t.id, inq."userId", true, t."createdAt"
FROM "Ticket" t
JOIN "Inquilino" inq ON inq.id = t."inquilinoId";

-- Destinatario: proprietario dell'immobile
INSERT INTO "SegnalazioneDestinatario" ("id", "segnalazioneId", "userId", "letto")
SELECT gen_random_uuid()::text, t.id, p."userId", false
FROM "Ticket" t
JOIN "Immobile" i ON i.id = t."immobileId"
JOIN "Proprietario" p ON p.id = i."proprietarioId";

-- ============================================================
-- Rimozione dei vecchi modelli, ora completamente migrati
-- ============================================================

-- DropForeignKey
ALTER TABLE "SegnalazioneCondominiale" DROP CONSTRAINT "SegnalazioneCondominiale_condominioId_fkey";

-- DropForeignKey
ALTER TABLE "SegnalazioneCondominiale" DROP CONSTRAINT "SegnalazioneCondominiale_immobileId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_immobileId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_inquilinoId_fkey";

-- DropTable
DROP TABLE "SegnalazioneCondominiale";

-- DropTable
DROP TABLE "Ticket";

-- DropEnum
DROP TYPE "StatoTicket";

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_creatoDaUserId_fkey" FOREIGN KEY ("creatoDaUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_immobileId_fkey" FOREIGN KEY ("immobileId") REFERENCES "Immobile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegnalazioneDestinatario" ADD CONSTRAINT "SegnalazioneDestinatario_segnalazioneId_fkey" FOREIGN KEY ("segnalazioneId") REFERENCES "Segnalazione"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegnalazioneDestinatario" ADD CONSTRAINT "SegnalazioneDestinatario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegnalazioneRisposta" ADD CONSTRAINT "SegnalazioneRisposta_segnalazioneId_fkey" FOREIGN KEY ("segnalazioneId") REFERENCES "Segnalazione"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegnalazioneRisposta" ADD CONSTRAINT "SegnalazioneRisposta_autoreUserId_fkey" FOREIGN KEY ("autoreUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
