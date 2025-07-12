-- AddForeignKey
ALTER TABLE "staging_righe_contabili" ADD CONSTRAINT "staging_righe_contabili_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "staging_testate"("codiceUnivocoScaricamento") ON DELETE CASCADE ON UPDATE CASCADE;
