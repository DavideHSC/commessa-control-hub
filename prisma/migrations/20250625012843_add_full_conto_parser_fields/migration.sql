-- AlterTable
ALTER TABLE "CodiceIva" ADD COLUMN     "percentuale" DOUBLE PRECISION,
ADD COLUMN     "validitaFine" TIMESTAMP(3),
ADD COLUMN     "validitaInizio" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Conto" ADD COLUMN     "tabellaItalstudio" TEXT;
