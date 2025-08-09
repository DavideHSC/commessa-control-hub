/*
  Warnings:

  - Made the column `codiceFiscaleAzienda` on table `Conto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Conto" ALTER COLUMN "codiceFiscaleAzienda" SET NOT NULL,
ALTER COLUMN "codiceFiscaleAzienda" SET DEFAULT '';
