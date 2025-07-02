/*
  Warnings:

  - A unique constraint covering the columns `[codice]` on the table `CausaleContabile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `codice` on table `CondizionePagamento` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CondizionePagamento" ALTER COLUMN "codice" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CausaleContabile_codice_key" ON "CausaleContabile"("codice");
