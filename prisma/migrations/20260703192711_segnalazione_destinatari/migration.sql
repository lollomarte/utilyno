-- AlterTable
ALTER TABLE "SegnalazioneCondominiale" ADD COLUMN     "immobileId" TEXT,
ADD COLUMN     "notificaInquilino" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notificaProprietario" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "SegnalazioneCondominiale" ADD CONSTRAINT "SegnalazioneCondominiale_immobileId_fkey" FOREIGN KEY ("immobileId") REFERENCES "Immobile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
