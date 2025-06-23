/*
  Warnings:

  - You are about to drop the `import_scritture_righe_iva` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "import_scritture_righe_iva" DROP CONSTRAINT "import_scritture_righe_iva_importScritturaTestataId_fkey";

-- DropTable
DROP TABLE "import_scritture_righe_iva";

-- CreateTable
CREATE TABLE "ImportScritturaRigaIva" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "riga" INTEGER NOT NULL,
    "codiceIva" TEXT NOT NULL,
    "codiceConto" TEXT,
    "imponibile" DOUBLE PRECISION NOT NULL,
    "imposta" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ImportScritturaRigaIva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportScritturaRigaIva_codiceUnivocoScaricamento_idx" ON "ImportScritturaRigaIva"("codiceUnivocoScaricamento");

-- AddForeignKey
ALTER TABLE "ImportScritturaRigaIva" ADD CONSTRAINT "ImportScritturaRigaIva_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "import_scritture_testate"("codiceUnivocoScaricamento") ON DELETE CASCADE ON UPDATE CASCADE;
