/*
  Warnings:

  - You are about to drop the `ImportScritturaRigaContabile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImportScritturaRigaContabile" DROP CONSTRAINT "ImportScritturaRigaContabile_codiceUnivocoScaricamento_fkey";

-- DropTable
DROP TABLE "ImportScritturaRigaContabile";

-- CreateTable
CREATE TABLE "import_scritture_righe_contabili" (
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
    "centroDiCosto" TEXT,
    "importoAnalitico" DOUBLE PRECISION,

    CONSTRAINT "import_scritture_righe_contabili_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "import_scritture_righe_contabili" ADD CONSTRAINT "import_scritture_righe_contabili_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "ImportScritturaTestata"("codiceUnivocoScaricamento") ON DELETE RESTRICT ON UPDATE CASCADE;
