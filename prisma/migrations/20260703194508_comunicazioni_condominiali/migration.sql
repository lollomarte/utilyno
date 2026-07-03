-- CreateTable
CREATE TABLE "ComunicazioneCondominiale" (
    "id" TEXT NOT NULL,
    "condominioId" TEXT NOT NULL,
    "amministratoreId" TEXT NOT NULL,
    "titolo" TEXT NOT NULL,
    "testo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComunicazioneCondominiale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LetturaComunicazione" (
    "id" TEXT NOT NULL,
    "comunicazioneId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lettoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LetturaComunicazione_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LetturaComunicazione_comunicazioneId_userId_key" ON "LetturaComunicazione"("comunicazioneId", "userId");

-- AddForeignKey
ALTER TABLE "ComunicazioneCondominiale" ADD CONSTRAINT "ComunicazioneCondominiale_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetturaComunicazione" ADD CONSTRAINT "LetturaComunicazione_comunicazioneId_fkey" FOREIGN KEY ("comunicazioneId") REFERENCES "ComunicazioneCondominiale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetturaComunicazione" ADD CONSTRAINT "LetturaComunicazione_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
