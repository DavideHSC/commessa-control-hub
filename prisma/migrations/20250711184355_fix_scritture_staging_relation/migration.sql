/*
  Warnings:

  - You are about to drop the column `cliForCodiceFiscalePartita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `cliForIntraCodiceFiscale` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `cliForIntraSubcodice` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `cliForSiglaPartita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `cliForSubcodicePartita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `clienteFornitoreSubcodice` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceAttivita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceAttivitaIva` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceAttivitaIvaPartita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceCausale` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceFiscaleAzienda` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceNumerazioneIva` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceNumerazioneIvaPartita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceNumerazioneIvaVendite` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codicePagamento` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `codiceValuta` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `documentoBis` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `documentoBisPartita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `documentoData` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `documentoNumero` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `documentoNumeroPartita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `esercizio` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `importedAt` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `protocolloBis` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `protocolloBisAutofattura` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `protocolloNumero` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `protocolloNumeroAutofattura` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `sourceFileName` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `stato` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `subcodiceFiscaleAzienda` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `tipoGestionePartite` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `tipoRegistroIva` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `tipoRegistroIvaPartita` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `versamentoEstremi` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `versamentoModello` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `versamentoTipo` on the `StagingTestata` table. All the data in the column will be lost.
  - You are about to drop the column `importedAt` on the `staging_allocazioni` table. All the data in the column will be lost.
  - You are about to drop the column `sourceFileName` on the `staging_allocazioni` table. All the data in the column will be lost.
  - You are about to drop the column `contoDaRilevareMovimento1` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `contoDaRilevareMovimento2` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `dataFineCompetenza` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `dataFineCompetenzaAnalitica` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `dataInizioCompetenza` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `dataInizioCompetenzaAnalitica` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `dataRegistrazioneApertura` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `dettaglioCliForCodiceFiscale` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `dettaglioCliForSigla` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `dettaglioCliForSubcodice` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `esercizioDiRilevanzaFiscale` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `importedAt` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `insDatiMovimentiAnalitici` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `insDatiStudiDiSettore` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `noteDiCompetenza` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `progressivoNumeroRigo` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `siglaConto` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `sourceFileName` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `statoMovimentoStudi` on the `staging_righe_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `imponibile50CorrNonCons` on the `staging_righe_iva` table. All the data in the column will be lost.
  - You are about to drop the column `importedAt` on the `staging_righe_iva` table. All the data in the column will be lost.
  - You are about to drop the column `impostaIntrattenimenti` on the `staging_righe_iva` table. All the data in the column will be lost.
  - You are about to drop the column `sourceFileName` on the `staging_righe_iva` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `StagingTestata` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codiceUnivocoScaricamento,progressivoRigo]` on the table `staging_righe_contabili` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `StagingTestata` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "staging_righe_contabili" DROP CONSTRAINT "staging_righe_contabili_codiceUnivocoScaricamento_fkey";

-- DropIndex
DROP INDEX "StagingTestata_codiceUnivocoScaricamento_key";

-- DropIndex
DROP INDEX "staging_righe_contabili_codiceUnivocoScaricamento_progressi_key";

-- AlterTable
ALTER TABLE "StagingTestata" DROP COLUMN "cliForCodiceFiscalePartita",
DROP COLUMN "cliForIntraCodiceFiscale",
DROP COLUMN "cliForIntraSubcodice",
DROP COLUMN "cliForSiglaPartita",
DROP COLUMN "cliForSubcodicePartita",
DROP COLUMN "clienteFornitoreSubcodice",
DROP COLUMN "codiceAttivita",
DROP COLUMN "codiceAttivitaIva",
DROP COLUMN "codiceAttivitaIvaPartita",
DROP COLUMN "codiceCausale",
DROP COLUMN "codiceFiscaleAzienda",
DROP COLUMN "codiceNumerazioneIva",
DROP COLUMN "codiceNumerazioneIvaPartita",
DROP COLUMN "codiceNumerazioneIvaVendite",
DROP COLUMN "codicePagamento",
DROP COLUMN "codiceValuta",
DROP COLUMN "documentoBis",
DROP COLUMN "documentoBisPartita",
DROP COLUMN "documentoData",
DROP COLUMN "documentoNumero",
DROP COLUMN "documentoNumeroPartita",
DROP COLUMN "esercizio",
DROP COLUMN "importedAt",
DROP COLUMN "protocolloBis",
DROP COLUMN "protocolloBisAutofattura",
DROP COLUMN "protocolloNumero",
DROP COLUMN "protocolloNumeroAutofattura",
DROP COLUMN "sourceFileName",
DROP COLUMN "stato",
DROP COLUMN "subcodiceFiscaleAzienda",
DROP COLUMN "tipoGestionePartite",
DROP COLUMN "tipoRegistroIva",
DROP COLUMN "tipoRegistroIvaPartita",
DROP COLUMN "versamentoEstremi",
DROP COLUMN "versamentoModello",
DROP COLUMN "versamentoTipo",
ADD COLUMN     "causaleId" TEXT,
ADD COLUMN     "dataDocumento" TEXT,
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "numeroDocumento" TEXT,
ALTER COLUMN "codiceUnivocoScaricamento" DROP NOT NULL;

-- AlterTable
ALTER TABLE "staging_allocazioni" DROP COLUMN "importedAt",
DROP COLUMN "sourceFileName",
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "progressivoRigoContabile" TEXT,
ALTER COLUMN "codiceUnivocoScaricamento" DROP NOT NULL,
ALTER COLUMN "progressivoNumeroRigoCont" DROP NOT NULL,
ALTER COLUMN "allocazioneIdentifier" DROP NOT NULL;

-- AlterTable
ALTER TABLE "staging_righe_contabili" DROP COLUMN "contoDaRilevareMovimento1",
DROP COLUMN "contoDaRilevareMovimento2",
DROP COLUMN "dataFineCompetenza",
DROP COLUMN "dataFineCompetenzaAnalitica",
DROP COLUMN "dataInizioCompetenza",
DROP COLUMN "dataInizioCompetenzaAnalitica",
DROP COLUMN "dataRegistrazioneApertura",
DROP COLUMN "dettaglioCliForCodiceFiscale",
DROP COLUMN "dettaglioCliForSigla",
DROP COLUMN "dettaglioCliForSubcodice",
DROP COLUMN "esercizioDiRilevanzaFiscale",
DROP COLUMN "importedAt",
DROP COLUMN "insDatiMovimentiAnalitici",
DROP COLUMN "insDatiStudiDiSettore",
DROP COLUMN "noteDiCompetenza",
DROP COLUMN "progressivoNumeroRigo",
DROP COLUMN "siglaConto",
DROP COLUMN "sourceFileName",
DROP COLUMN "statoMovimentoStudi",
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "progressivoRigo" TEXT,
ALTER COLUMN "codiceUnivocoScaricamento" DROP NOT NULL;

-- AlterTable
ALTER TABLE "staging_righe_iva" DROP COLUMN "imponibile50CorrNonCons",
DROP COLUMN "importedAt",
DROP COLUMN "impostaIntrattenimenti",
DROP COLUMN "sourceFileName",
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "riga" TEXT,
ALTER COLUMN "codiceUnivocoScaricamento" DROP NOT NULL,
ALTER COLUMN "rigaIdentifier" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StagingTestata_externalId_key" ON "StagingTestata"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "staging_righe_contabili_codiceUnivocoScaricamento_progressi_key" ON "staging_righe_contabili"("codiceUnivocoScaricamento", "progressivoRigo");

-- AddForeignKey
ALTER TABLE "staging_righe_contabili" ADD CONSTRAINT "staging_righe_contabili_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "StagingTestata"("externalId") ON DELETE CASCADE ON UPDATE CASCADE;
