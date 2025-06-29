/*
  Warnings:

  - Added the required column `end` to the `FieldDefinition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FieldDefinition" ADD COLUMN     "end" INTEGER NOT NULL;
