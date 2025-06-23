/*
  Warnings:

  - You are about to drop the column `progressivoNumeroRigo` on the `ImportScritturaRigaContabile` table. All the data in the column will be lost.
  - You are about to drop the column `progressivoNumeroRigo` on the `ImportScritturaRigaIva` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codiceUnivocoScaricamento,riga]` on the table `ImportScritturaRigaContabile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codiceUnivocoScaricamento,riga]` on the table `ImportScritturaRigaIva` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `WizardState` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `riga` to the `ImportScritturaRigaContabile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `riga` to the `ImportScritturaRigaIva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WizardState` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `WizardState` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ImportScritturaRigaContabile_codiceUnivocoScaricamento_prog_key";

-- DropIndex
DROP INDEX "ImportScritturaRigaIva_codiceUnivocoScaricamento_progressiv_key";

-- AlterTable
ALTER TABLE "ImportScritturaRigaContabile" DROP COLUMN "progressivoNumeroRigo",
ADD COLUMN     "riga" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ImportScritturaRigaIva" DROP COLUMN "progressivoNumeroRigo",
ADD COLUMN     "riga" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "WizardState" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "step" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ImportScritturaRigaContabile_codiceUnivocoScaricamento_riga_key" ON "ImportScritturaRigaContabile"("codiceUnivocoScaricamento", "riga");

-- CreateIndex
CREATE UNIQUE INDEX "ImportScritturaRigaIva_codiceUnivocoScaricamento_riga_key" ON "ImportScritturaRigaIva"("codiceUnivocoScaricamento", "riga");

-- CreateIndex
CREATE UNIQUE INDEX "WizardState_userId_key" ON "WizardState"("userId");

-- AddForeignKey
ALTER TABLE "import_allocazioni" ADD CONSTRAINT "import_allocazioni_commessaId_fkey" FOREIGN KEY ("commessaId") REFERENCES "Commessa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
