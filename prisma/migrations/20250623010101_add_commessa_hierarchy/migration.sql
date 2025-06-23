-- AlterTable
ALTER TABLE "Commessa" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "Commessa" ADD CONSTRAINT "Commessa_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Commessa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
