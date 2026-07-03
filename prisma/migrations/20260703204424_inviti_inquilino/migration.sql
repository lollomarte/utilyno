-- CreateTable
CREATE TABLE "InvitoInquilino" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "contrattoId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "scadenza" TIMESTAMP(3) NOT NULL,
    "usatoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvitoInquilino_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvitoInquilino_token_key" ON "InvitoInquilino"("token");

-- AddForeignKey
ALTER TABLE "InvitoInquilino" ADD CONSTRAINT "InvitoInquilino_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitoInquilino" ADD CONSTRAINT "InvitoInquilino_contrattoId_fkey" FOREIGN KEY ("contrattoId") REFERENCES "Contratto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
