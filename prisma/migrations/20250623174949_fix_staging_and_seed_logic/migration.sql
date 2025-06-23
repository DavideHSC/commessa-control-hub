/*
  Warnings:

  - You are about to drop the column `completed` on the `WizardState` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WizardState` table. All the data in the column will be lost.
  - You are about to drop the `ImportScritturaRigaContabile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImportScritturaTestata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StagingAllocazione` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `payload` to the `WizardState` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `step` on the `WizardState` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ImportScritturaRigaContabile" DROP CONSTRAINT "ImportScritturaRigaContabile_testataId_fkey";

-- DropForeignKey
ALTER TABLE "StagingAllocazione" DROP CONSTRAINT "StagingAllocazione_rigaContabileId_fkey";

-- DropIndex
DROP INDEX "WizardState_userId_key";

-- AlterTable
ALTER TABLE "WizardState" DROP COLUMN "completed",
DROP COLUMN "userId",
ADD COLUMN     "payload" JSONB NOT NULL,
DROP COLUMN "step",
ADD COLUMN     "step" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ImportScritturaRigaContabile";

-- DropTable
DROP TABLE "ImportScritturaTestata";

-- DropTable
DROP TABLE "StagingAllocazione";

-- CreateTable
CREATE TABLE "import_scritture_testate" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "codiceCausale" TEXT,
    "descrizioneCausale" TEXT,
    "dataRegistrazione" TIMESTAMP(3),
    "dataDocumento" TIMESTAMP(3),
    "numeroDocumento" TEXT,
    "noteMovimento" TEXT,

    CONSTRAINT "import_scritture_testate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_scritture_righe_contabili" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "riga" INTEGER NOT NULL,
    "codiceConto" TEXT,
    "note" TEXT,
    "importoDare" DOUBLE PRECISION,
    "importoAvere" DOUBLE PRECISION,
    "importScritturaTestataId" TEXT,

    CONSTRAINT "import_scritture_righe_contabili_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_allocazioni" (
    "id" TEXT NOT NULL,
    "importScritturaRigaContabileId" TEXT NOT NULL,
    "commessaId" TEXT NOT NULL,
    "importo" DOUBLE PRECISION NOT NULL,
    "percentuale" DOUBLE PRECISION,
    "suggerimentoAutomatico" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "import_allocazioni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_scritture_righe_iva" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "riga" INTEGER NOT NULL,
    "imponibile" DOUBLE PRECISION,
    "imposta" DOUBLE PRECISION,
    "codiceIva" TEXT,
    "importScritturaTestataId" TEXT,

    CONSTRAINT "import_scritture_righe_iva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "import_scritture_testate_codiceUnivocoScaricamento_key" ON "import_scritture_testate"("codiceUnivocoScaricamento");

-- AddForeignKey
ALTER TABLE "import_scritture_righe_contabili" ADD CONSTRAINT "import_scritture_righe_contabili_importScritturaTestataId_fkey" FOREIGN KEY ("importScritturaTestataId") REFERENCES "import_scritture_testate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_allocazioni" ADD CONSTRAINT "import_allocazioni_importScritturaRigaContabileId_fkey" FOREIGN KEY ("importScritturaRigaContabileId") REFERENCES "import_scritture_righe_contabili"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_scritture_righe_iva" ADD CONSTRAINT "import_scritture_righe_iva_importScritturaTestataId_fkey" FOREIGN KEY ("importScritturaTestataId") REFERENCES "import_scritture_testate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
