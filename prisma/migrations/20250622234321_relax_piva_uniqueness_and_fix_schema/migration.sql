/*
  Warnings:

  - You are about to drop the column `causaleId` on the `CampoDatiPrimari` table. All the data in the column will be lost.
  - You are about to drop the column `fieldId` on the `CampoDatiPrimari` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `CampoDatiPrimari` table. All the data in the column will be lost.
  - You are about to drop the column `riferimentoConto` on the `CampoDatiPrimari` table. All the data in the column will be lost.
  - You are about to drop the column `dataFine` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `dataInizio` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `noteMovimento` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `tipoAggiornamento` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `tipoRegistroIva` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `contoIncassoPagamento` on the `CondizionePagamento` table. All the data in the column will be lost.
  - You are about to drop the column `inizioScadenza` on the `CondizionePagamento` table. All the data in the column will be lost.
  - You are about to drop the column `numeroRate` on the `CondizionePagamento` table. All the data in the column will be lost.
  - You are about to drop the column `suddivisione` on the `CondizionePagamento` table. All the data in the column will be lost.
  - You are about to drop the column `nomeCampo` on the `FieldDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `FieldDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `ImportTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `causaleId` on the `VoceTemplateScrittura` table. All the data in the column will be lost.
  - You are about to drop the column `contoId` on the `VoceTemplateScrittura` table. All the data in the column will be lost.
  - You are about to drop the column `contoRiferimentoDatiPrimari` on the `VoceTemplateScrittura` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nome]` on the table `CampoDatiPrimari` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codice]` on the table `CondizionePagamento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ImportTemplate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `descrizione` to the `CampoDatiPrimari` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `CampoDatiPrimari` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voceTemplateId` to the `CampoDatiPrimari` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descrizione` to the `VoceTemplateScrittura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `VoceTemplateScrittura` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CampoDatiPrimari" DROP CONSTRAINT "CampoDatiPrimari_causaleId_fkey";

-- DropForeignKey
ALTER TABLE "FieldDefinition" DROP CONSTRAINT "FieldDefinition_templateId_fkey";

-- DropForeignKey
ALTER TABLE "VoceTemplateScrittura" DROP CONSTRAINT "VoceTemplateScrittura_causaleId_fkey";

-- DropIndex
DROP INDEX "CampoDatiPrimari_causaleId_fieldId_key";

-- DropIndex
DROP INDEX "CausaleContabile_nome_key";

-- DropIndex
DROP INDEX "Cliente_piva_key";

-- DropIndex
DROP INDEX "Fornitore_piva_key";

-- DropIndex
DROP INDEX "ImportTemplate_nome_key";

-- AlterTable
ALTER TABLE "CampoDatiPrimari" DROP COLUMN "causaleId",
DROP COLUMN "fieldId",
DROP COLUMN "label",
DROP COLUMN "riferimentoConto",
ADD COLUMN     "descrizione" TEXT NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "opzioni" TEXT[],
ADD COLUMN     "voceTemplateId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CausaleContabile" DROP COLUMN "dataFine",
DROP COLUMN "dataInizio",
DROP COLUMN "nome",
DROP COLUMN "noteMovimento",
DROP COLUMN "tipoAggiornamento",
DROP COLUMN "tipoRegistroIva",
ADD COLUMN     "fatturaInValuta" BOOLEAN,
ADD COLUMN     "generazioneAutofattura" BOOLEAN,
ADD COLUMN     "gestioneRitenute" TEXT,
ADD COLUMN     "imponibilePredefinito" DOUBLE PRECISION,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "protocolloIva" TEXT,
ADD COLUMN     "tipoDocumentoIva" TEXT,
ADD COLUMN     "tipoIva" TEXT,
ADD COLUMN     "versamentoRitenute" BOOLEAN;

-- AlterTable
ALTER TABLE "CondizionePagamento" DROP COLUMN "contoIncassoPagamento",
DROP COLUMN "inizioScadenza",
DROP COLUMN "numeroRate",
DROP COLUMN "suddivisione",
ADD COLUMN     "codice" TEXT;

-- AlterTable
ALTER TABLE "Conto" ALTER COLUMN "codice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FieldDefinition" DROP COLUMN "nomeCampo",
DROP COLUMN "type",
ADD COLUMN     "fieldName" TEXT,
ADD COLUMN     "format" TEXT;

-- AlterTable
ALTER TABLE "ImportTemplate" DROP COLUMN "nome",
ADD COLUMN     "fileIdentifier" TEXT,
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "RigaIva" ALTER COLUMN "rigaScritturaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VoceTemplateScrittura" DROP COLUMN "causaleId",
DROP COLUMN "contoId",
DROP COLUMN "contoRiferimentoDatiPrimari",
ADD COLUMN     "descrizione" TEXT NOT NULL,
ADD COLUMN     "templateId" TEXT NOT NULL,
ALTER COLUMN "formulaImporto" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "rowCount" INTEGER NOT NULL,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WizardState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "step" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WizardState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportScritturaTestata" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "codiceFiscaleAzienda" TEXT,
    "subcodiceFiscaleAzienda" TEXT,
    "codiceAttivita" TEXT,
    "esercizio" TEXT,
    "codiceCausale" TEXT,
    "descrizioneCausale" TEXT,
    "dataRegistrazione" TIMESTAMP(3),
    "codiceAttivitaIva" TEXT,
    "tipoRegistroIva" TEXT,
    "codiceNumerazioneIva" TEXT,
    "clienteFornitoreCodiceFiscale" TEXT,
    "clienteFornitoreSubcodiceFiscale" TEXT,
    "clienteFornitoreSigla" TEXT,
    "dataDocumento" TIMESTAMP(3),
    "numeroDocumento" TEXT,
    "documentoBis" TEXT,
    "dataRegistroIva" TIMESTAMP(3),
    "protocolloNumero" INTEGER,
    "protocolloBis" TEXT,
    "dataCompetenzaLiquidIva" TIMESTAMP(3),
    "totaleDocumento" DOUBLE PRECISION,
    "dataCompetenzaContabile" TIMESTAMP(3),
    "noteMovimento" TEXT,
    "dataPlafond" TIMESTAMP(3),
    "annoProRata" INTEGER,
    "ritenute" DOUBLE PRECISION,
    "enasarco" DOUBLE PRECISION,
    "totaleInValuta" DOUBLE PRECISION,
    "codiceValuta" TEXT,
    "codiceNumerazioneIvaVendite" TEXT,
    "protocolloNumeroAutofattura" INTEGER,
    "protocolloBisAutofattura" TEXT,
    "versamentoData" TIMESTAMP(3),
    "versamentoTipo" TEXT,
    "versamentoModello" TEXT,
    "versamentoEstremi" TEXT,
    "stato" TEXT,
    "tipoGestionePartite" TEXT,
    "codicePagamento" TEXT,
    "rataPartitaCodiceAttivitaIva" TEXT,
    "rataPartitaTipoRegistroIva" TEXT,
    "rataPartitaCodiceNumerazioneIva" TEXT,
    "rataPartitaCliForCodiceFiscale" TEXT,
    "rataPartitaCliForSubcodice" TEXT,
    "rataPartitaCliForSigla" TEXT,
    "rataPartitaDocumentoData" TIMESTAMP(3),
    "rataPartitaDocumentoNumero" TEXT,
    "rataPartitaDocumentoBis" TEXT,
    "intraCliForCodiceFiscale" TEXT,
    "intraCliForSubcodiceFiscale" TEXT,
    "intraCliForSigla" TEXT,
    "tipoMovimentoIntrastat" TEXT,
    "documentoOperazioneIntrastat" TIMESTAMP(3),

    CONSTRAINT "ImportScritturaTestata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportScritturaRigaContabile" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "progressivoNumeroRigo" INTEGER,
    "tipoConto" TEXT,
    "clienteFornitoreCodiceFiscale" TEXT,
    "clienteFornitoreSubcodiceFiscale" TEXT,
    "clienteFornitoreSigla" TEXT,
    "conto" TEXT,
    "siglaConto" TEXT,
    "importoDare" DOUBLE PRECISION,
    "importoAvere" DOUBLE PRECISION,
    "note" TEXT,
    "insDatiCompetenzaContabile" BOOLEAN,
    "dataInizioCompetenza" TIMESTAMP(3),
    "dataFineCompetenza" TIMESTAMP(3),
    "noteDiCompetenza" TEXT,
    "insDatiMovimentiAnalitici" BOOLEAN,
    "dataInizioCompetenzaAnalitica" TIMESTAMP(3),
    "dataFineCompetenzaAnalitica" TIMESTAMP(3),

    CONSTRAINT "ImportScritturaRigaContabile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportScritturaRigaIva" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "codiceIva" TEXT,
    "contropartita" TEXT,
    "siglaContropartita" TEXT,
    "imponibile" DOUBLE PRECISION,
    "imposta" DOUBLE PRECISION,
    "impostaIntrattenimenti" DOUBLE PRECISION,
    "imponibile50CorrNonCons" DOUBLE PRECISION,
    "impostaNonConsiderata" DOUBLE PRECISION,
    "importoLordo" DOUBLE PRECISION,
    "note" TEXT,

    CONSTRAINT "ImportScritturaRigaIva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportScritturaTestata_codiceUnivocoScaricamento_key" ON "ImportScritturaTestata"("codiceUnivocoScaricamento");

-- CreateIndex
CREATE UNIQUE INDEX "CampoDatiPrimari_nome_key" ON "CampoDatiPrimari"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "CondizionePagamento_codice_key" ON "CondizionePagamento"("codice");

-- CreateIndex
CREATE UNIQUE INDEX "ImportTemplate_name_key" ON "ImportTemplate"("name");

-- AddForeignKey
ALTER TABLE "CampoDatiPrimari" ADD CONSTRAINT "CampoDatiPrimari_voceTemplateId_fkey" FOREIGN KEY ("voceTemplateId") REFERENCES "VoceTemplateScrittura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoceTemplateScrittura" ADD CONSTRAINT "VoceTemplateScrittura_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ImportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDefinition" ADD CONSTRAINT "FieldDefinition_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ImportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportScritturaRigaContabile" ADD CONSTRAINT "ImportScritturaRigaContabile_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "ImportScritturaTestata"("codiceUnivocoScaricamento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportScritturaRigaIva" ADD CONSTRAINT "ImportScritturaRigaIva_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "ImportScritturaTestata"("codiceUnivocoScaricamento") ON DELETE RESTRICT ON UPDATE CASCADE;
