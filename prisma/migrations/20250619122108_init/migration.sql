-- CreateEnum
CREATE TYPE "TipoConto" AS ENUM ('Costo', 'Ricavo', 'Patrimoniale', 'Fornitore', 'Cliente');

-- CreateEnum
CREATE TYPE "TipoCampo" AS ENUM ('number', 'select', 'text', 'date');

-- CreateEnum
CREATE TYPE "SezioneScrittura" AS ENUM ('Dare', 'Avere');

-- CreateEnum
CREATE TYPE "FormulaImporto" AS ENUM ('imponibile', 'iva', 'totale');

-- CreateTable
CREATE TABLE "VoceAnalitica" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,

    CONSTRAINT "VoceAnalitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conto" (
    "id" TEXT NOT NULL,
    "codice" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoConto" NOT NULL,
    "richiedeVoceAnalitica" BOOLEAN NOT NULL DEFAULT false,
    "vociAnaliticheAbilitateIds" TEXT[],
    "contropartiteSuggeriteIds" TEXT[],
    "voceAnaliticaSuggeritaId" TEXT,

    CONSTRAINT "Conto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commessa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "clienteId" TEXT,
    "descrizione" TEXT,

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
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "causaleId" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "datiAggiuntivi" JSONB,

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
    "importo" DOUBLE PRECISION NOT NULL,
    "descrizione" TEXT,
    "rigaScritturaId" TEXT NOT NULL,
    "commessaId" TEXT NOT NULL,
    "voceAnaliticaId" TEXT NOT NULL,

    CONSTRAINT "Allocazione_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CausaleContabile" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,

    CONSTRAINT "CausaleContabile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampoDatiPrimari" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tipo" "TipoCampo" NOT NULL,
    "riferimentoConto" "TipoConto",
    "causaleId" TEXT NOT NULL,

    CONSTRAINT "CampoDatiPrimari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoceTemplateScrittura" (
    "id" TEXT NOT NULL,
    "sezione" "SezioneScrittura" NOT NULL,
    "contoId" TEXT NOT NULL,
    "formulaImporto" "FormulaImporto" NOT NULL,
    "causaleId" TEXT NOT NULL,

    CONSTRAINT "VoceTemplateScrittura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoceAnalitica_nome_key" ON "VoceAnalitica"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Conto_codice_key" ON "Conto"("codice");

-- CreateIndex
CREATE UNIQUE INDEX "Commessa_nome_key" ON "Commessa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetVoce_commessaId_voceAnaliticaId_key" ON "BudgetVoce"("commessaId", "voceAnaliticaId");

-- CreateIndex
CREATE UNIQUE INDEX "CausaleContabile_nome_key" ON "CausaleContabile"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "CampoDatiPrimari_causaleId_fieldId_key" ON "CampoDatiPrimari"("causaleId", "fieldId");

-- AddForeignKey
ALTER TABLE "Conto" ADD CONSTRAINT "Conto_voceAnaliticaSuggeritaId_fkey" FOREIGN KEY ("voceAnaliticaSuggeritaId") REFERENCES "VoceAnalitica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetVoce" ADD CONSTRAINT "BudgetVoce_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetVoce" ADD CONSTRAINT "BudgetVoce_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES "VoceAnalitica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaScrittura" ADD CONSTRAINT "RigaScrittura_contoId_fkey" FOREIGN KEY ("contoId") REFERENCES "Conto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaScrittura" ADD CONSTRAINT "RigaScrittura_scritturaContabileId_fkey" FOREIGN KEY ("scritturaContabileId") REFERENCES "ScritturaContabile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocazione" ADD CONSTRAINT "Allocazione_rigaScritturaId_fkey" FOREIGN KEY ("rigaScritturaId") REFERENCES "RigaScrittura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocazione" ADD CONSTRAINT "Allocazione_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocazione" ADD CONSTRAINT "Allocazione_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES "VoceAnalitica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampoDatiPrimari" ADD CONSTRAINT "CampoDatiPrimari_causaleId_fkey" FOREIGN KEY ("causaleId") REFERENCES "CausaleContabile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoceTemplateScrittura" ADD CONSTRAINT "VoceTemplateScrittura_causaleId_fkey" FOREIGN KEY ("causaleId") REFERENCES "CausaleContabile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
