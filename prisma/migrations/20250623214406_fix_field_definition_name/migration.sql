/*
  Warnings:

  - You are about to drop the column `fieldName` on the `FieldDefinition` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[templateId,fileIdentifier,nomeCampo]` on the table `FieldDefinition` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nomeCampo` to the `FieldDefinition` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FieldDefinition_templateId_fileIdentifier_fieldName_key";

-- AlterTable
ALTER TABLE "FieldDefinition" DROP COLUMN "fieldName",
ADD COLUMN     "nomeCampo" TEXT NOT NULL,
ALTER COLUMN "fileIdentifier" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FieldDefinition_templateId_fileIdentifier_nomeCampo_key" ON "FieldDefinition"("templateId", "fileIdentifier", "nomeCampo");
