/*
  Warnings:

  - You are about to drop the column `sottocontoFornitore` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `sottocontoCliente` on the `Fornitore` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sottocontoCliente]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sottocontoFornitore]` on the table `Fornitore` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "sottocontoFornitore",
ADD COLUMN     "codiceDestinatario" TEXT,
ADD COLUMN     "condizionePagamentoId" TEXT,
ADD COLUMN     "sottocontoCosto" TEXT,
ADD COLUMN     "sottocontoPassivo" TEXT;

-- AlterTable
ALTER TABLE "Fornitore" DROP COLUMN "sottocontoCliente",
ADD COLUMN     "codiceDestinatario" TEXT,
ADD COLUMN     "condizionePagamentoId" TEXT,
ADD COLUMN     "sottocontoCosto" TEXT,
ADD COLUMN     "sottocontoPassivo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_sottocontoCliente_key" ON "Cliente"("sottocontoCliente");

-- CreateIndex
CREATE UNIQUE INDEX "Fornitore_sottocontoFornitore_key" ON "Fornitore"("sottocontoFornitore");
