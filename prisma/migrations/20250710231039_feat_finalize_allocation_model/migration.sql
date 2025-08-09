/*
  Warnings:

  - Changed the type of `tipoMovimento` on the `Allocazione` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoMovimentoAnalitico" AS ENUM ('COSTO_EFFETTIVO', 'RICAVO_EFFETTIVO', 'COSTO_STIMATO', 'RICAVO_STIMATO', 'COSTO_BUDGET', 'RICAVO_BUDGET');

-- DropForeignKey
ALTER TABLE "Allocazione" DROP CONSTRAINT "Allocazione_commessaId_fkey";

-- DropForeignKey
ALTER TABLE "Allocazione" DROP CONSTRAINT "Allocazione_voceAnaliticaId_fkey";

-- AlterTable
ALTER TABLE "Allocazione" DROP COLUMN "tipoMovimento",
ADD COLUMN     "tipoMovimento" "TipoMovimentoAnalitico" NOT NULL;

-- AddForeignKey
ALTER TABLE "Allocazione" ADD CONSTRAINT "Allocazione_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocazione" ADD CONSTRAINT "Allocazione_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES "VoceAnalitica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
