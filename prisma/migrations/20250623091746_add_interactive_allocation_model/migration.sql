/*
  Warnings:

  - You are about to drop the column `centroDiCosto` on the `ImportScritturaRigaContabile` table. All the data in the column will be lost.
  - You are about to drop the column `importoAnalitico` on the `ImportScritturaRigaContabile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ImportScritturaRigaContabile" DROP COLUMN "centroDiCosto",
DROP COLUMN "importoAnalitico";

-- CreateTable
CREATE TABLE "import_allocazioni" (
    "id" TEXT NOT NULL,
    "importo" DOUBLE PRECISION NOT NULL,
    "percentuale" DOUBLE PRECISION,
    "suggerimentoAutomatico" BOOLEAN NOT NULL DEFAULT false,
    "commessaId" TEXT NOT NULL,
    "importScritturaRigaContabileId" TEXT NOT NULL,

    CONSTRAINT "import_allocazioni_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "import_allocazioni" ADD CONSTRAINT "import_allocazioni_importScritturaRigaContabileId_fkey" FOREIGN KEY ("importScritturaRigaContabileId") REFERENCES "ImportScritturaRigaContabile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
