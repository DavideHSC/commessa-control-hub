-- AlterTable
ALTER TABLE "import_scritture_testate" ADD COLUMN     "codiceFornitore" TEXT;

-- AddForeignKey
ALTER TABLE "import_scritture_testate" ADD CONSTRAINT "import_scritture_testate_codiceCausale_fkey" FOREIGN KEY ("codiceCausale") REFERENCES "CausaleContabile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "import_scritture_testate" ADD CONSTRAINT "import_scritture_testate_codiceFornitore_fkey" FOREIGN KEY ("codiceFornitore") REFERENCES "Fornitore"("externalId") ON DELETE NO ACTION ON UPDATE NO ACTION;
