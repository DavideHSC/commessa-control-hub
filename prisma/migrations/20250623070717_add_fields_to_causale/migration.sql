-- AlterTable
ALTER TABLE "CausaleContabile" ADD COLUMN     "dataFine" TIMESTAMP(3),
ADD COLUMN     "dataInizio" TIMESTAMP(3),
ADD COLUMN     "noteMovimento" TEXT,
ADD COLUMN     "tipoAggiornamento" TEXT,
ADD COLUMN     "tipoMovimento" TEXT,
ADD COLUMN     "tipoRegistroIva" TEXT;
