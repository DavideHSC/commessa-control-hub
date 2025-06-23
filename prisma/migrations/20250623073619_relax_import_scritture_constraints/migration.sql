/*
  Warnings:

  - You are about to drop the `ImportScritturaTestata` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImportScritturaRigaContabile" DROP CONSTRAINT "ImportScritturaRigaContabile_codiceUnivocoScaricamento_fkey";

-- DropForeignKey
ALTER TABLE "ImportScritturaRigaIva" DROP CONSTRAINT "ImportScritturaRigaIva_codiceUnivocoScaricamento_fkey";

-- DropTable
DROP TABLE "ImportScritturaTestata";

-- CreateTable
CREATE TABLE "import_scritture_testate" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "codiceCausale" TEXT NOT NULL,
    "descrizioneCausale" TEXT NOT NULL,
    "dataRegistrazione" TIMESTAMP(3),
    "tipoRegistroIva" TEXT,
    "clienteFornitoreCodiceFiscale" TEXT,
    "clienteFornitoreSigla" TEXT,
    "dataDocumento" TIMESTAMP(3),
    "numeroDocumento" TEXT,
    "protocolloNumero" TEXT,
    "totaleDocumento" DOUBLE PRECISION,
    "noteMovimento" TEXT,

    CONSTRAINT "import_scritture_testate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "import_scritture_testate_codiceUnivocoScaricamento_key" ON "import_scritture_testate"("codiceUnivocoScaricamento");

-- AddForeignKey
ALTER TABLE "ImportScritturaRigaContabile" ADD CONSTRAINT "ImportScritturaRigaContabile_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "import_scritture_testate"("codiceUnivocoScaricamento") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportScritturaRigaIva" ADD CONSTRAINT "ImportScritturaRigaIva_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "import_scritture_testate"("codiceUnivocoScaricamento") ON DELETE CASCADE ON UPDATE CASCADE;
