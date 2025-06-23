-- AlterTable
ALTER TABLE "CondizionePagamento" ADD COLUMN     "contoIncassoPagamento" TEXT,
ADD COLUMN     "inizioScadenza" TEXT,
ADD COLUMN     "numeroRate" INTEGER,
ADD COLUMN     "suddivisione" TEXT;
