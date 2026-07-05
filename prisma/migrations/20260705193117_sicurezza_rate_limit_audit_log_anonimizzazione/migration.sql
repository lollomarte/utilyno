-- AlterTable
ALTER TABLE "User" ADD COLUMN     "anonimizzatoAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TentativoLogin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "esito" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TentativoLogin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAzione" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "azione" TEXT NOT NULL,
    "entita" TEXT NOT NULL,
    "entitaId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAzione_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TentativoLogin_email_createdAt_idx" ON "TentativoLogin"("email", "createdAt");

-- CreateIndex
CREATE INDEX "LogAzione_entita_entitaId_idx" ON "LogAzione"("entita", "entitaId");

-- CreateIndex
CREATE INDEX "LogAzione_userId_idx" ON "LogAzione"("userId");

-- CreateIndex
CREATE INDEX "LogAzione_createdAt_idx" ON "LogAzione"("createdAt");
