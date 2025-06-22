/*
  Warnings:

  - You are about to drop the `ImportLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WizardStep` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "CodiceIva" ADD COLUMN     "indetraibilita" DOUBLE PRECISION,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "tipoCalcolo" TEXT;

-- AlterTable
ALTER TABLE "CondizionePagamento" ADD COLUMN     "contoIncassoPagamento" TEXT,
ADD COLUMN     "inizioScadenza" TEXT,
ADD COLUMN     "numeroRate" INTEGER,
ADD COLUMN     "suddivisione" TEXT;

-- DropTable
DROP TABLE "ImportLog";

-- DropTable
DROP TABLE "WizardStep";
