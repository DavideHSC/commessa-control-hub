/*
  Warnings:

  - You are about to drop the column `sourceFileName` on the `staging_conti` table. All the data in the column will be lost.
  - The `validoImpresaOrdinaria` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validoImpresaSemplificata` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validoProfessionistaOrdinario` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validoProfessionistaSemplificato` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validoUnicoPf` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validoUnicoSp` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validoUnicoSc` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `validoUnicoEnc` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `percDeduzioneManutenzione` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `utilizzaDescrizioneLocale` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `consideraNelBilancioSemplificato` column on the `staging_conti` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "staging_conti" DROP COLUMN "sourceFileName",
DROP COLUMN "validoImpresaOrdinaria",
ADD COLUMN     "validoImpresaOrdinaria" BOOLEAN,
DROP COLUMN "validoImpresaSemplificata",
ADD COLUMN     "validoImpresaSemplificata" BOOLEAN,
DROP COLUMN "validoProfessionistaOrdinario",
ADD COLUMN     "validoProfessionistaOrdinario" BOOLEAN,
DROP COLUMN "validoProfessionistaSemplificato",
ADD COLUMN     "validoProfessionistaSemplificato" BOOLEAN,
DROP COLUMN "validoUnicoPf",
ADD COLUMN     "validoUnicoPf" BOOLEAN,
DROP COLUMN "validoUnicoSp",
ADD COLUMN     "validoUnicoSp" BOOLEAN,
DROP COLUMN "validoUnicoSc",
ADD COLUMN     "validoUnicoSc" BOOLEAN,
DROP COLUMN "validoUnicoEnc",
ADD COLUMN     "validoUnicoEnc" BOOLEAN,
DROP COLUMN "percDeduzioneManutenzione",
ADD COLUMN     "percDeduzioneManutenzione" DOUBLE PRECISION,
DROP COLUMN "utilizzaDescrizioneLocale",
ADD COLUMN     "utilizzaDescrizioneLocale" BOOLEAN,
DROP COLUMN "consideraNelBilancioSemplificato",
ADD COLUMN     "consideraNelBilancioSemplificato" BOOLEAN;
