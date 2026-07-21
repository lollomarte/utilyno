-- CreateEnum
CREATE TYPE "CondizioneImmobile" AS ENUM ('NUOVO', 'RISTRUTTURATO', 'DA_RISTRUTTURARE');

-- CreateEnum
CREATE TYPE "TipoRiscaldamento" AS ENUM ('AUTONOMO', 'CENTRALIZZATO');

-- CreateEnum
CREATE TYPE "CategoriaDocumento" AS ENUM ('CONTRATTO', 'APE', 'PLANIMETRIA', 'CARTA_IDENTITA', 'VISURA_CATASTALE', 'POLIZZA', 'ALTRO');

-- AlterTable
ALTER TABLE "Agenzia" ADD COLUMN     "codiceSdi" TEXT,
ADD COLUMN     "ibanAgenzia" TEXT,
ADD COLUMN     "pec" TEXT;

-- AlterTable
ALTER TABLE "Amministratore" ADD COLUMN     "codiceSdi" TEXT,
ADD COLUMN     "pec" TEXT;

-- AlterTable
ALTER TABLE "Assicurazione" ADD COLUMN     "valoreAssicurato" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ChecklistImmobile" ADD COLUMN     "letturaAcqua" DOUBLE PRECISION,
ADD COLUMN     "letturaGas" DOUBLE PRECISION,
ADD COLUMN     "letturaLuce" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Condominio" ADD COLUMN     "annoCostruzione" INTEGER,
ADD COLUMN     "ascensore" BOOLEAN,
ADD COLUMN     "codiceFiscale" TEXT,
ADD COLUMN     "ibanCondominio" TEXT,
ADD COLUMN     "impiantiComuni" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "categoria" "CategoriaDocumento",
ADD COLUMN     "nota" TEXT,
ADD COLUMN     "scadenzaDocumento" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Immobile" ADD COLUMN     "annoCostruzione" INTEGER,
ADD COLUMN     "apeScadenza" TIMESTAMP(3),
ADD COLUMN     "arredato" BOOLEAN,
ADD COLUMN     "ascensore" BOOLEAN,
ADD COLUMN     "categoriaCatastale" TEXT,
ADD COLUMN     "condizioneImmobile" "CondizioneImmobile",
ADD COLUMN     "dotazioni" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "foglio" TEXT,
ADD COLUMN     "noteStima" TEXT,
ADD COLUMN     "numeroVani" INTEGER,
ADD COLUMN     "particella" TEXT,
ADD COLUMN     "piano" TEXT,
ADD COLUMN     "renditaCatastale" DOUBLE PRECISION,
ADD COLUMN     "speseCondominialiMensili" DOUBLE PRECISION,
ADD COLUMN     "subalterno" TEXT,
ADD COLUMN     "tipoRiscaldamento" "TipoRiscaldamento";

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "pec" TEXT,
ADD COLUMN     "piva" TEXT;

-- AlterTable
ALTER TABLE "Proprietario" ADD COLUMN     "ibanProprietario" TEXT;

-- AlterTable
ALTER TABLE "Segnalazione" ADD COLUMN     "fasciaOrariaDisponibile" TEXT,
ADD COLUMN     "fotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Utenza" ADD COLUMN     "codicePdr" TEXT,
ADD COLUMN     "codicePod" TEXT,
ADD COLUMN     "fornitoreUscente" TEXT,
ADD COLUMN     "indirizzoFornitura" TEXT;
