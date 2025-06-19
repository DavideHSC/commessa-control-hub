/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `CausaleContabile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `Commessa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `Conto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `ScritturaContabile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `VoceAnalitica` will be added. If there are existing duplicate values, this will fail.
  - Made the column `clienteId` on table `Commessa` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CausaleContabile" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "Commessa" ADD COLUMN     "externalId" TEXT,
ALTER COLUMN "clienteId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Conto" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "ScritturaContabile" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "fornitoreId" TEXT;

-- AlterTable
ALTER TABLE "VoceAnalitica" ADD COLUMN     "externalId" TEXT;

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "nome" TEXT NOT NULL,
    "piva" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornitore" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "nome" TEXT NOT NULL,
    "piva" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornitore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_externalId_key" ON "Cliente"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_piva_key" ON "Cliente"("piva");

-- CreateIndex
CREATE UNIQUE INDEX "Fornitore_externalId_key" ON "Fornitore"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornitore_piva_key" ON "Fornitore"("piva");

-- CreateIndex
CREATE UNIQUE INDEX "CausaleContabile_externalId_key" ON "CausaleContabile"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Commessa_externalId_key" ON "Commessa"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Conto_externalId_key" ON "Conto"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ScritturaContabile_externalId_key" ON "ScritturaContabile"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "VoceAnalitica_externalId_key" ON "VoceAnalitica"("externalId");

-- AddForeignKey
ALTER TABLE "Commessa" ADD CONSTRAINT "Commessa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScritturaContabile" ADD CONSTRAINT "ScritturaContabile_fornitoreId_fkey" FOREIGN KEY ("fornitoreId") REFERENCES "Fornitore"("id") ON DELETE SET NULL ON UPDATE CASCADE;
