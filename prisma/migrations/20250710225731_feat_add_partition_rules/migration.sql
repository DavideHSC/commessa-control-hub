/*
  Warnings:

  - You are about to drop the column `contoCodice` on the `RegolaRipartizione` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contoId,commessaId,voceAnaliticaId]` on the table `RegolaRipartizione` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contoId` to the `RegolaRipartizione` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voceAnaliticaId` to the `RegolaRipartizione` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('CSV', 'XLSX', 'PDF', 'TXT', 'JSON', 'XML');

-- DropForeignKey
ALTER TABLE "RegolaRipartizione" DROP CONSTRAINT "RegolaRipartizione_commessaId_fkey";

-- AlterTable
ALTER TABLE "RegolaRipartizione" DROP COLUMN "contoCodice",
ADD COLUMN     "contoId" TEXT NOT NULL,
ADD COLUMN     "voceAnaliticaId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RegolaRipartizione_contoId_commessaId_voceAnaliticaId_key" ON "RegolaRipartizione"("contoId", "commessaId", "voceAnaliticaId");

-- AddForeignKey
ALTER TABLE "RegolaRipartizione" ADD CONSTRAINT "RegolaRipartizione_contoId_fkey" FOREIGN KEY ("contoId") REFERENCES "Conto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegolaRipartizione" ADD CONSTRAINT "RegolaRipartizione_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegolaRipartizione" ADD CONSTRAINT "RegolaRipartizione_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES "VoceAnalitica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
