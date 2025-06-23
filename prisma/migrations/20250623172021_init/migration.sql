-- CreateEnum
CREATE TYPE "TipoConto" AS ENUM ('Costo', 'Ricavo', 'Patrimoniale', 'Fornitore', 'Cliente');

-- CreateEnum
CREATE TYPE "TipoCampo" AS ENUM ('number', 'select', 'text', 'date');

-- CreateEnum
CREATE TYPE "SezioneScrittura" AS ENUM ('Dare', 'Avere');

-- CreateEnum
CREATE TYPE "FormulaImporto" AS ENUM ('imponibile', 'iva', 'totale');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "nome" TEXT NOT NULL,
    "piva" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "codiceFiscale" TEXT,
    "cap" TEXT,
    "codicePagamento" TEXT,
    "codiceValuta" TEXT,
    "cognome" TEXT,
    "comune" TEXT,
    "comuneNascita" TEXT,
    "dataNascita" TIMESTAMP(3),
    "indirizzo" TEXT,
    "nazione" TEXT,
    "nomeAnagrafico" TEXT,
    "provincia" TEXT,
    "sesso" TEXT,
    "telefono" TEXT,
    "tipoAnagrafica" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornitore" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "nome" TEXT NOT NULL,
    "piva" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "codiceFiscale" TEXT,
    "aliquota" DOUBLE PRECISION,
    "attivitaMensilizzazione" INTEGER,
    "cap" TEXT,
    "codicePagamento" TEXT,
    "codiceRitenuta" TEXT,
    "codiceValuta" TEXT,
    "cognome" TEXT,
    "comune" TEXT,
    "comuneNascita" TEXT,
    "contributoPrevidenziale" BOOLEAN,
    "contributoPrevidenzialeL335" TEXT,
    "dataNascita" TIMESTAMP(3),
    "enasarco" BOOLEAN,
    "gestione770" BOOLEAN,
    "indirizzo" TEXT,
    "nazione" TEXT,
    "nomeAnagrafico" TEXT,
    "percContributoCassaPrev" DOUBLE PRECISION,
    "provincia" TEXT,
    "quadro770" TEXT,
    "sesso" TEXT,
    "soggettoInail" BOOLEAN,
    "soggettoRitenuta" BOOLEAN,
    "telefono" TEXT,
    "tipoAnagrafica" TEXT,
    "tipoRitenuta" TEXT,

    CONSTRAINT "Fornitore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoceAnalitica" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "externalId" TEXT,

    CONSTRAINT "VoceAnalitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conto" (
    "id" TEXT NOT NULL,
    "codice" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" "TipoConto" NOT NULL,
    "richiedeVoceAnalitica" BOOLEAN NOT NULL DEFAULT false,
    "vociAnaliticheAbilitateIds" TEXT[],
    "contropartiteSuggeriteIds" TEXT[],
    "externalId" TEXT,
    "voceAnaliticaId" TEXT,

    CONSTRAINT "Conto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commessa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "dataCreazione" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAggiornamento" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "commessaPadreId" TEXT,

    CONSTRAINT "Commessa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetVoce" (
    "id" TEXT NOT NULL,
    "importo" DOUBLE PRECISION NOT NULL,
    "commessaId" TEXT NOT NULL,
    "voceAnaliticaId" TEXT NOT NULL,

    CONSTRAINT "BudgetVoce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScritturaContabile" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "causaleId" TEXT,
    "descrizione" TEXT NOT NULL,
    "datiAggiuntivi" JSONB,
    "externalId" TEXT,
    "fornitoreId" TEXT,
    "dataDocumento" TIMESTAMP(3),
    "numeroDocumento" TEXT,

    CONSTRAINT "ScritturaContabile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RigaScrittura" (
    "id" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "dare" DOUBLE PRECISION NOT NULL,
    "avere" DOUBLE PRECISION NOT NULL,
    "contoId" TEXT NOT NULL,
    "scritturaContabileId" TEXT NOT NULL,

    CONSTRAINT "RigaScrittura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allocazione" (
    "id" TEXT NOT NULL,
    "rigaScritturaId" TEXT NOT NULL,
    "importo" DOUBLE PRECISION NOT NULL,
    "commessaId" TEXT NOT NULL,
    "voceAnaliticaId" TEXT,

    CONSTRAINT "Allocazione_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodiceIva" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "descrizione" TEXT NOT NULL,
    "aliquota" DOUBLE PRECISION,
    "indetraibilita" DOUBLE PRECISION,
    "note" TEXT,
    "tipoCalcolo" TEXT,
    "dataFine" TIMESTAMP(3),
    "dataInizio" TIMESTAMP(3),

    CONSTRAINT "CodiceIva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CondizionePagamento" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "descrizione" TEXT NOT NULL,
    "codice" TEXT,
    "contoIncassoPagamento" TEXT,
    "inizioScadenza" TEXT,
    "numeroRate" INTEGER,
    "suddivisione" TEXT,

    CONSTRAINT "CondizionePagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RigaIva" (
    "id" TEXT NOT NULL,
    "imponibile" DOUBLE PRECISION NOT NULL,
    "imposta" DOUBLE PRECISION NOT NULL,
    "codiceIvaId" TEXT NOT NULL,
    "rigaScritturaId" TEXT,

    CONSTRAINT "RigaIva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CausaleContabile" (
    "id" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "externalId" TEXT,
    "nome" TEXT,
    "dataFine" TIMESTAMP(3),
    "dataInizio" TIMESTAMP(3),
    "noteMovimento" TEXT,
    "tipoAggiornamento" TEXT,
    "tipoMovimento" TEXT,
    "tipoRegistroIva" TEXT,

    CONSTRAINT "CausaleContabile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampoDatiPrimari" (
    "id" TEXT NOT NULL,
    "tipo" "TipoCampo" NOT NULL,
    "descrizione" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "opzioni" TEXT[],
    "voceTemplateId" TEXT NOT NULL,

    CONSTRAINT "CampoDatiPrimari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoceTemplateScrittura" (
    "id" TEXT NOT NULL,
    "sezione" "SezioneScrittura" NOT NULL,
    "formulaImporto" "FormulaImporto",
    "descrizione" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "VoceTemplateScrittura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportTemplate" (
    "id" TEXT NOT NULL,
    "modelName" TEXT,
    "fileIdentifier" TEXT,
    "name" TEXT,

    CONSTRAINT "ImportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldDefinition" (
    "id" TEXT NOT NULL,
    "start" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    "fileIdentifier" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "format" TEXT,

    CONSTRAINT "FieldDefinition_pkey" PRIMARY KEY ("id")
);

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
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WizardState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportScritturaTestata" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "codiceCausale" TEXT,
    "descrizioneCausale" TEXT,
    "dataRegistrazione" TIMESTAMP(3),
    "dataDocumento" TIMESTAMP(3),
    "numeroDocumento" TEXT,
    "totaleDocumento" DOUBLE PRECISION,
    "noteMovimento" TEXT,

    CONSTRAINT "ImportScritturaTestata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportScritturaRigaContabile" (
    "id" TEXT NOT NULL,
    "testataId" TEXT NOT NULL,
    "codiceConto" TEXT,
    "descrizioneConto" TEXT,
    "importoDare" DOUBLE PRECISION,
    "importoAvere" DOUBLE PRECISION,
    "note" TEXT,
    "insDatiMovimentiAnalitici" BOOLEAN,

    CONSTRAINT "ImportScritturaRigaContabile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StagingAllocazione" (
    "id" TEXT NOT NULL,
    "rigaContabileId" TEXT NOT NULL,
    "commessaId" TEXT NOT NULL,
    "importo" DOUBLE PRECISION NOT NULL,
    "voceAnaliticaId" TEXT,

    CONSTRAINT "StagingAllocazione_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_externalId_key" ON "Cliente"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornitore_externalId_key" ON "Fornitore"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "VoceAnalitica_nome_key" ON "VoceAnalitica"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "VoceAnalitica_externalId_key" ON "VoceAnalitica"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Conto_codice_key" ON "Conto"("codice");

-- CreateIndex
CREATE UNIQUE INDEX "Conto_externalId_key" ON "Conto"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Commessa_externalId_key" ON "Commessa"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetVoce_commessaId_voceAnaliticaId_key" ON "BudgetVoce"("commessaId", "voceAnaliticaId");

-- CreateIndex
CREATE UNIQUE INDEX "ScritturaContabile_externalId_key" ON "ScritturaContabile"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CodiceIva_externalId_key" ON "CodiceIva"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CondizionePagamento_externalId_key" ON "CondizionePagamento"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CondizionePagamento_codice_key" ON "CondizionePagamento"("codice");

-- CreateIndex
CREATE UNIQUE INDEX "CausaleContabile_externalId_key" ON "CausaleContabile"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "CampoDatiPrimari_nome_key" ON "CampoDatiPrimari"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ImportTemplate_name_key" ON "ImportTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FieldDefinition_templateId_fileIdentifier_fieldName_key" ON "FieldDefinition"("templateId", "fileIdentifier", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "WizardState_userId_key" ON "WizardState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ImportScritturaTestata_codiceUnivocoScaricamento_key" ON "ImportScritturaTestata"("codiceUnivocoScaricamento");

-- AddForeignKey
ALTER TABLE "Conto" ADD CONSTRAINT "Conto_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES "VoceAnalitica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commessa" ADD CONSTRAINT "Commessa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commessa" ADD CONSTRAINT "Commessa_commessaPadreId_fkey" FOREIGN KEY ("commessaPadreId") REFERENCES "Commessa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetVoce" ADD CONSTRAINT "BudgetVoce_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetVoce" ADD CONSTRAINT "BudgetVoce_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES "VoceAnalitica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScritturaContabile" ADD CONSTRAINT "ScritturaContabile_causaleId_fkey" FOREIGN KEY ("causaleId") REFERENCES "CausaleContabile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScritturaContabile" ADD CONSTRAINT "ScritturaContabile_fornitoreId_fkey" FOREIGN KEY ("fornitoreId") REFERENCES "Fornitore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaScrittura" ADD CONSTRAINT "RigaScrittura_contoId_fkey" FOREIGN KEY ("contoId") REFERENCES "Conto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaScrittura" ADD CONSTRAINT "RigaScrittura_scritturaContabileId_fkey" FOREIGN KEY ("scritturaContabileId") REFERENCES "ScritturaContabile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocazione" ADD CONSTRAINT "Allocazione_rigaScritturaId_fkey" FOREIGN KEY ("rigaScritturaId") REFERENCES "RigaScrittura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocazione" ADD CONSTRAINT "Allocazione_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocazione" ADD CONSTRAINT "Allocazione_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES "VoceAnalitica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaIva" ADD CONSTRAINT "RigaIva_codiceIvaId_fkey" FOREIGN KEY ("codiceIvaId") REFERENCES "CodiceIva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaIva" ADD CONSTRAINT "RigaIva_rigaScritturaId_fkey" FOREIGN KEY ("rigaScritturaId") REFERENCES "RigaScrittura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampoDatiPrimari" ADD CONSTRAINT "CampoDatiPrimari_voceTemplateId_fkey" FOREIGN KEY ("voceTemplateId") REFERENCES "VoceTemplateScrittura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoceTemplateScrittura" ADD CONSTRAINT "VoceTemplateScrittura_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ImportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldDefinition" ADD CONSTRAINT "FieldDefinition_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ImportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportScritturaRigaContabile" ADD CONSTRAINT "ImportScritturaRigaContabile_testataId_fkey" FOREIGN KEY ("testataId") REFERENCES "ImportScritturaTestata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StagingAllocazione" ADD CONSTRAINT "StagingAllocazione_rigaContabileId_fkey" FOREIGN KEY ("rigaContabileId") REFERENCES "ImportScritturaRigaContabile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
