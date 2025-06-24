/*
  Warnings:

  - A unique constraint covering the columns `[codice]` on the table `CausaleContabile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CausaleContabile" ADD COLUMN     "codice" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CausaleContabile_codice_key" ON "CausaleContabile"("codice");
