/*
  Warnings:

  - You are about to drop the column `fatturaInValuta` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `generazioneAutofattura` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `gestioneRitenute` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `imponibilePredefinito` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `protocolloIva` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `tipoDocumentoIva` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `tipoIva` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `tipoMovimento` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `versamentoRitenute` on the `CausaleContabile` table. All the data in the column will be lost.
  - You are about to drop the column `voceAnaliticaSuggeritaId` on the `Conto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conto" DROP CONSTRAINT "Conto_voceAnaliticaSuggeritaId_fkey";

-- AlterTable
ALTER TABLE "CausaleContabile" DROP COLUMN "fatturaInValuta",
DROP COLUMN "generazioneAutofattura",
DROP COLUMN "gestioneRitenute",
DROP COLUMN "imponibilePredefinito",
DROP COLUMN "note",
DROP COLUMN "protocolloIva",
DROP COLUMN "tipoDocumentoIva",
DROP COLUMN "tipoIva",
DROP COLUMN "tipoMovimento",
DROP COLUMN "versamentoRitenute",
ADD COLUMN     "nome" TEXT;

-- AlterTable
ALTER TABLE "Conto" DROP COLUMN "voceAnaliticaSuggeritaId",
ADD COLUMN     "voceAnaliticaId" TEXT;

-- AddForeignKey
ALTER TABLE "Conto" ADD CONSTRAINT "Conto_voceAnaliticaId_fkey" FOREIGN KEY ("voceAnaliticaId") REFERENCES "VoceAnalitica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScritturaContabile" ADD CONSTRAINT "ScritturaContabile_causaleId_fkey" FOREIGN KEY ("causaleId") REFERENCES "CausaleContabile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
