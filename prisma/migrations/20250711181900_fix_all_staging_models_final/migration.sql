/*
  Warnings:

  - You are about to drop the column `codice` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `codiceRegistro` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `descrizione` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `validitaFine` on the `staging_anagrafiche` table. All the data in the column will be lost.
  - You are about to drop the column `validitaInizio` on the `staging_anagrafiche` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "staging_anagrafiche" DROP COLUMN "codice",
DROP COLUMN "codiceRegistro",
DROP COLUMN "descrizione",
DROP COLUMN "tipo",
DROP COLUMN "validitaFine",
DROP COLUMN "validitaInizio",
ADD COLUMN     "CODICE_ANAGRAFICA" TEXT,
ADD COLUMN     "CODICE_FISCALE_AZIENDA" TEXT,
ADD COLUMN     "CODICE_FISCALE_CLIFOR" TEXT,
ADD COLUMN     "CODICE_UNIVOCO" TEXT,
ADD COLUMN     "DENOMINAZIONE" TEXT,
ADD COLUMN     "PARTITA_IVA" TEXT,
ADD COLUMN     "SOTTOCONTO_CLIENTE" TEXT,
ADD COLUMN     "SOTTOCONTO_FORNITORE" TEXT,
ADD COLUMN     "SUBCODICE_AZIENDA" TEXT,
ADD COLUMN     "SUBCODICE_CLIFOR" TEXT,
ADD COLUMN     "TIPO_CONTO" TEXT,
ADD COLUMN     "TIPO_SOGGETTO" TEXT,
ADD COLUMN     "aliquota" TEXT,
ADD COLUMN     "attivitaMensilizzazione" TEXT,
ADD COLUMN     "cap" TEXT,
ADD COLUMN     "codiceIncassoCliente" TEXT,
ADD COLUMN     "codiceIncassoPagamento" TEXT,
ADD COLUMN     "codiceIso" TEXT,
ADD COLUMN     "codicePagamentoFornitore" TEXT,
ADD COLUMN     "codiceRitenuta" TEXT,
ADD COLUMN     "codiceValuta" TEXT,
ADD COLUMN     "cognome" TEXT,
ADD COLUMN     "comuneNascita" TEXT,
ADD COLUMN     "comuneResidenza" TEXT,
ADD COLUMN     "contributoPrevid335" TEXT,
ADD COLUMN     "contributoPrevidenziale" TEXT,
ADD COLUMN     "dataNascita" TEXT,
ADD COLUMN     "enasarco" TEXT,
ADD COLUMN     "gestioneDati770" TEXT,
ADD COLUMN     "idFiscaleEstero" TEXT,
ADD COLUMN     "indirizzo" TEXT,
ADD COLUMN     "nome" TEXT,
ADD COLUMN     "numeroTelefono" TEXT,
ADD COLUMN     "percContributoCassa" TEXT,
ADD COLUMN     "prefissoTelefono" TEXT,
ADD COLUMN     "quadro770" TEXT,
ADD COLUMN     "sesso" TEXT,
ADD COLUMN     "soggettoARitenuta" TEXT,
ADD COLUMN     "soggettoInail" TEXT,
ADD COLUMN     "tipoRitenuta" TEXT;
