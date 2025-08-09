/*
  Warnings:

  - A unique constraint covering the columns `[codice]` on the table `Conto` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Conto_codice_codiceFiscaleAzienda_key";

-- CreateIndex
CREATE UNIQUE INDEX "Conto_codice_key" ON "Conto"("codice");
