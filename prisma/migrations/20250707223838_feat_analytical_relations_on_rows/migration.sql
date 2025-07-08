-- DropForeignKey
ALTER TABLE "RigaScrittura" DROP CONSTRAINT "RigaScrittura_contoId_fkey";

-- AlterTable
ALTER TABLE "ImportScritturaRigaContabile" ADD COLUMN     "tipoConto" TEXT;

-- AlterTable
ALTER TABLE "RigaScrittura" ADD COLUMN     "clienteId" TEXT,
ADD COLUMN     "fornitoreId" TEXT,
ALTER COLUMN "contoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RigaScrittura" ADD CONSTRAINT "RigaScrittura_contoId_fkey" FOREIGN KEY ("contoId") REFERENCES "Conto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaScrittura" ADD CONSTRAINT "RigaScrittura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RigaScrittura" ADD CONSTRAINT "RigaScrittura_fornitoreId_fkey" FOREIGN KEY ("fornitoreId") REFERENCES "Fornitore"("id") ON DELETE SET NULL ON UPDATE CASCADE;
