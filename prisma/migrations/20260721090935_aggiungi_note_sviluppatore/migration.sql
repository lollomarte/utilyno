-- CreateEnum
CREATE TYPE "TipoNotaSviluppatore" AS ENUM ('BUG', 'SUGGERIMENTO');

-- CreateTable
CREATE TABLE "NotaSviluppatore" (
    "id" TEXT NOT NULL,
    "testo" TEXT NOT NULL,
    "tipo" "TipoNotaSviluppatore" NOT NULL DEFAULT 'SUGGERIMENTO',
    "risolta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autoreUserId" TEXT NOT NULL,

    CONSTRAINT "NotaSviluppatore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotaSviluppatore_autoreUserId_idx" ON "NotaSviluppatore"("autoreUserId");

-- CreateIndex
CREATE INDEX "NotaSviluppatore_createdAt_idx" ON "NotaSviluppatore"("createdAt");

-- AddForeignKey
ALTER TABLE "NotaSviluppatore" ADD CONSTRAINT "NotaSviluppatore_autoreUserId_fkey" FOREIGN KEY ("autoreUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
