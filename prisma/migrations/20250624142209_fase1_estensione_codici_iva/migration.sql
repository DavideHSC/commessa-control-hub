/*
  Warnings:

  - You are about to drop the column `dataFine` on the `CodiceIva` table. All the data in the column will be lost.
  - You are about to drop the column `dataInizio` on the `CodiceIva` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CodiceIva" DROP COLUMN "dataFine",
DROP COLUMN "dataInizio",
ADD COLUMN     "codice" TEXT,
ADD COLUMN     "codiceExport" TEXT,
ADD COLUMN     "dataAggiornamento" TIMESTAMP(3),
ADD COLUMN     "esclusoDaIva" BOOLEAN,
ADD COLUMN     "esente" BOOLEAN,
ADD COLUMN     "fuoriCampoIva" BOOLEAN,
ADD COLUMN     "imponibile" BOOLEAN,
ADD COLUMN     "imposta" BOOLEAN,
ADD COLUMN     "inSospensione" BOOLEAN,
ADD COLUMN     "inUso" BOOLEAN,
ADD COLUMN     "natura" TEXT,
ADD COLUMN     "nonImponibile" BOOLEAN,
ADD COLUMN     "nonImponibileConPlafond" BOOLEAN,
ADD COLUMN     "reverseCharge" BOOLEAN,
ADD COLUMN     "splitPayment" BOOLEAN,
ADD COLUMN     "tipoCalcoloDesc" TEXT;
