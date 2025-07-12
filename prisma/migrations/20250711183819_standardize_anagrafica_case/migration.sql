/*
  Warnings:

  - You are about to drop the column `CODICE_ANAGRAFICA` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `CODICE_FISCALE_AZIENDA` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `CODICE_FISCALE_CLIFOR` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `CODICE_UNIVOCO` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `DENOMINAZIONE` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `PARTITA_IVA` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `SOTTOCONTO_CLIENTE` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `SOTTOCONTO_FORNITORE` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `SUBCODICE_AZIENDA` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `SUBCODICE_CLIFOR` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `TIPO_CONTO` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `TIPO_SOGGETTO` on the `staging_anagrafiche` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "staging_anagrafiche" DROP COLUMN "CODICE_ANAGRAFICA",
DROP COLUMN "CODICE_FISCALE_AZIENDA",
DROP COLUMN "CODICE_FISCALE_CLIFOR",
DROP COLUMN "CODICE_UNIVOCO",
DROP COLUMN "DENOMINAZIONE",
DROP COLUMN "PARTITA_IVA",
DROP COLUMN "SOTTOCONTO_CLIENTE",
DROP COLUMN "SOTTOCONTO_FORNITORE",
DROP COLUMN "SUBCODICE_AZIENDA",
DROP COLUMN "SUBCODICE_CLIFOR",
DROP COLUMN "TIPO_CONTO",
DROP COLUMN "TIPO_SOGGETTO",
ADD COLUMN     "codiceAnagrafica" TEXT,
ADD COLUMN     "codiceFiscaleAzienda" TEXT,
ADD COLUMN     "codiceFiscaleClifor" TEXT,
ADD COLUMN     "codiceUnivoco" TEXT,
ADD COLUMN     "denominazione" TEXT,
ADD COLUMN     "partitaIva" TEXT,
ADD COLUMN     "sottocontoCliente" TEXT,
ADD COLUMN     "sottocontoFornitore" TEXT,
ADD COLUMN     "subcodiceAzienda" TEXT,
ADD COLUMN     "subcodiceClifor" TEXT,
ADD COLUMN     "tipoConto" TEXT,
ADD COLUMN     "tipoSoggetto" TEXT;
