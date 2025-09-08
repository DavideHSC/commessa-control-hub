/*
  Warnings:

  - You are about to drop the column `importJobId` on the `staging_righe_iva` table. All the data in the column will be lost.
  - You are about to drop the column `importJobId` on the `staging_testate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Commessa" ADD COLUMN     "isAttiva" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priorita" TEXT DEFAULT 'media';

-- AlterTable
ALTER TABLE "VoceAnalitica" ADD COLUMN     "isAttiva" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "staging_righe_iva" DROP COLUMN "importJobId";

-- AlterTable
ALTER TABLE "staging_testate" DROP COLUMN "importJobId";
