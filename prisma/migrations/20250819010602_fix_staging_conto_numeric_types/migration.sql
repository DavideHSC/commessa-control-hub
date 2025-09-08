/*
  Warnings:

  - The `numeroColonnaRegCronologico` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `numeroColonnaRegIncassiPag` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "staging_conti" DROP COLUMN "numeroColonnaRegCronologico",
ADD COLUMN     "numeroColonnaRegCronologico" INTEGER,
DROP COLUMN "numeroColonnaRegIncassiPag",
ADD COLUMN     "numeroColonnaRegIncassiPag" INTEGER;
