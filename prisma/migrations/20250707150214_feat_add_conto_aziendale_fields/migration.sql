/*
  Warnings:

  - A unique constraint covering the columns `[codice,codiceFiscaleAzienda]` on the table `Conto` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Conto_codice_key";

-- AlterTable
ALTER TABLE "Conto" ADD COLUMN     "codiceFiscaleAzienda" TEXT,
ADD COLUMN     "consideraBilancioSemplificato" BOOLEAN,
ADD COLUMN     "descrizioneLocale" TEXT,
ADD COLUMN     "subcodiceAzienda" TEXT,
ADD COLUMN     "utilizzaDescrizioneLocale" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "Conto_codice_codiceFiscaleAzienda_key" ON "Conto"("codice", "codiceFiscaleAzienda");
