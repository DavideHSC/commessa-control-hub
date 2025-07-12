/*
  Warnings:

  - You are about to drop the column `parentId` on the `Commessa` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `staging_righe_iva` table. All the data in the column will be lost.
  - You are about to drop the `StagingTestata` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dataFineCompetenza` to the `staging_righe_contabili` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataFineCompetenzaAnalit` to the `staging_righe_contabili` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataInizioCompetenza` to the `staging_righe_contabili` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataInizioCompetenzaAnalit` to the `staging_righe_contabili` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataRegistrazioneApertura` to the `staging_righe_contabili` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `staging_righe_contabili` table without a default value. This is not possible if the table is not empty.
  - Made the column `codiceUnivocoScaricamento` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipoConto` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clienteFornitoreCodiceFiscale` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clienteFornitoreSubcodice` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clienteFornitoreSigla` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `conto` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `importoDare` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `importoAvere` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `note` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `insDatiCompetenzaContabile` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `externalId` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Made the column `progressivoRigo` on table `staging_righe_contabili` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `importJobId` to the `staging_righe_iva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `staging_righe_iva` table without a default value. This is not possible if the table is not empty.
  - Made the column `codiceUnivocoScaricamento` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rigaIdentifier` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `codiceIva` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contropartita` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imponibile` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imposta` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `impostaNonConsiderata` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `importoLordo` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `note` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `riga` on table `staging_righe_iva` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Commessa" DROP CONSTRAINT "Commessa_parentId_fkey";

-- DropForeignKey
ALTER TABLE "staging_righe_contabili" DROP CONSTRAINT "staging_righe_contabili_codiceUnivocoScaricamento_fkey";

-- DropIndex
DROP INDEX "Commessa_nome_key";

-- DropIndex
DROP INDEX "staging_righe_contabili_codiceUnivocoScaricamento_progressi_key";

-- AlterTable
ALTER TABLE "Commessa" DROP COLUMN "parentId",
ADD COLUMN     "dataFine" TIMESTAMP(3),
ADD COLUMN     "dataInizio" TIMESTAMP(3),
ADD COLUMN     "stato" TEXT;

-- AlterTable
ALTER TABLE "staging_righe_contabili" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataFineCompetenza" TEXT NOT NULL,
ADD COLUMN     "dataFineCompetenzaAnalit" TEXT NOT NULL,
ADD COLUMN     "dataInizioCompetenza" TEXT NOT NULL,
ADD COLUMN     "dataInizioCompetenzaAnalit" TEXT NOT NULL,
ADD COLUMN     "dataRegistrazioneApertura" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "codiceUnivocoScaricamento" SET NOT NULL,
ALTER COLUMN "tipoConto" SET NOT NULL,
ALTER COLUMN "clienteFornitoreCodiceFiscale" SET NOT NULL,
ALTER COLUMN "clienteFornitoreSubcodice" SET NOT NULL,
ALTER COLUMN "clienteFornitoreSigla" SET NOT NULL,
ALTER COLUMN "conto" SET NOT NULL,
ALTER COLUMN "importoDare" SET NOT NULL,
ALTER COLUMN "importoAvere" SET NOT NULL,
ALTER COLUMN "note" SET NOT NULL,
ALTER COLUMN "insDatiCompetenzaContabile" SET NOT NULL,
ALTER COLUMN "externalId" SET NOT NULL,
ALTER COLUMN "progressivoRigo" SET NOT NULL;

-- AlterTable
ALTER TABLE "staging_righe_iva" DROP COLUMN "externalId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "importJobId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "codiceUnivocoScaricamento" SET NOT NULL,
ALTER COLUMN "rigaIdentifier" SET NOT NULL,
ALTER COLUMN "codiceIva" SET NOT NULL,
ALTER COLUMN "contropartita" SET NOT NULL,
ALTER COLUMN "imponibile" SET NOT NULL,
ALTER COLUMN "imposta" SET NOT NULL,
ALTER COLUMN "impostaNonConsiderata" SET NOT NULL,
ALTER COLUMN "importoLordo" SET NOT NULL,
ALTER COLUMN "note" SET NOT NULL,
ALTER COLUMN "riga" SET NOT NULL;

-- DropTable
DROP TABLE "StagingTestata";

-- CreateTable
CREATE TABLE "staging_testate" (
    "id" TEXT NOT NULL,
    "importJobId" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "esercizio" TEXT NOT NULL,
    "codiceAzienda" TEXT NOT NULL,
    "codiceCausale" TEXT NOT NULL,
    "descrizioneCausale" TEXT NOT NULL,
    "dataRegistrazione" TEXT,
    "tipoRegistroIva" TEXT,
    "clienteFornitoreCodiceFiscale" TEXT,
    "clienteFornitoreSigla" TEXT,
    "dataDocumento" TEXT,
    "numeroDocumento" TEXT,
    "totaleDocumento" TEXT,
    "noteMovimento" TEXT,
    "dataRegistroIva" TEXT,
    "dataCompetenzaLiquidIva" TEXT,
    "dataCompetenzaContabile" TEXT,
    "dataPlafond" TEXT,
    "annoProRata" TEXT,
    "ritenute" TEXT,
    "esigibilitaIva" TEXT,
    "protocolloRegistroIva" TEXT,
    "flagQuadrSchedaContabile" TEXT,
    "flagStampaRegIva" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staging_testate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staging_testate_codiceUnivocoScaricamento_key" ON "staging_testate"("codiceUnivocoScaricamento");
