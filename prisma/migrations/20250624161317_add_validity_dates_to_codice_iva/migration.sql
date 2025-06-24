/*
  Warnings:

  - You are about to drop the column `imposta` on the `CodiceIva` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CodiceIva" DROP COLUMN "imposta",
ADD COLUMN     "dataFine" TIMESTAMP(3),
ADD COLUMN     "dataInizio" TIMESTAMP(3);
