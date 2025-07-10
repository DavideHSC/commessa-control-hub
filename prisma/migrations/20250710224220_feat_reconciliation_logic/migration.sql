/*
  Warnings:

  - You are about to drop the column `descrizione` on the `Allocazione` table. All the data in the column will be lost.
  - You are about to drop the column `voceAnaliticaId` on the `Conto` table. All the data in the column will be lost.
  - You are about to drop the column `vociAnaliticheAbilitateIds` on the `Conto` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `VoceAnalitica` table. All the data in the column will be lost.
  - Added the required column `dataMovimento` to the `Allocazione` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoMovimento` to the `Allocazione` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Allocazione` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `VoceAnalitica` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conto" DROP CONSTRAINT "Conto_voceAnaliticaId_fkey";

-- DropIndex
DROP INDEX "VoceAnalitica_externalId_key";

-- AlterTable
ALTER TABLE "Allocazione" DROP COLUMN "descrizione",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataMovimento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "tipoMovimento" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Conto" DROP COLUMN "voceAnaliticaId",
DROP COLUMN "vociAnaliticheAbilitateIds",
ADD COLUMN     "isRilevantePerCommesse" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RigaScrittura" ALTER COLUMN "dare" DROP NOT NULL,
ALTER COLUMN "avere" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VoceAnalitica" DROP COLUMN "externalId",
ADD COLUMN     "tipo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RegolaRipartizione" (
    "id" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "contoCodice" TEXT NOT NULL,
    "commessaId" TEXT NOT NULL,
    "percentuale" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegolaRipartizione_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContoToVoceAnalitica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContoToVoceAnalitica_AB_unique" ON "_ContoToVoceAnalitica"("A", "B");

-- CreateIndex
CREATE INDEX "_ContoToVoceAnalitica_B_index" ON "_ContoToVoceAnalitica"("B");

-- AddForeignKey
ALTER TABLE "RegolaRipartizione" ADD CONSTRAINT "RegolaRipartizione_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContoToVoceAnalitica" ADD CONSTRAINT "_ContoToVoceAnalitica_A_fkey" FOREIGN KEY ("A") REFERENCES "Conto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContoToVoceAnalitica" ADD CONSTRAINT "_ContoToVoceAnalitica_B_fkey" FOREIGN KEY ("B") REFERENCES "VoceAnalitica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
