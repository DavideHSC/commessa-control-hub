/*
  Warnings:

  - You are about to drop the column `codice` on the `staging_causali_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `staging_causali_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `validitaFine` on the `staging_causali_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `validitaInizio` on the `staging_causali_contabili` table. All the data in the column will be lost.
  - You are about to drop the column `codiceRegistro` on the `staging_codici_iva` table. All the data in the column will be lost.
  - You are about to drop the column `esigibilita` on the `staging_codici_iva` table. All the data in the column will be lost.
  - You are about to drop the column `naturaOperazione` on the `staging_codici_iva` table. All the data in the column will be lost.
  - You are about to drop the column `norma` on the `staging_codici_iva` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `staging_codici_iva` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOperazione` on the `staging_codici_iva` table. All the data in the column will be lost.
  - You are about to drop the column `codice` on the `staging_condizioni_pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `staging_condizioni_pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `validitaFine` on the `staging_condizioni_pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `validitaInizio` on the `staging_condizioni_pagamento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "staging_causali_contabili" DROP COLUMN "codice",
DROP COLUMN "tipo",
DROP COLUMN "validitaFine",
DROP COLUMN "validitaInizio",
ADD COLUMN     "codiceCausale" TEXT,
ADD COLUMN     "contoIva" TEXT,
ADD COLUMN     "contoIvaVendite" TEXT,
ADD COLUMN     "dataFine" TEXT,
ADD COLUMN     "dataInizio" TEXT,
ADD COLUMN     "descrizioneDocumento" TEXT,
ADD COLUMN     "fatturaEmessaRegCorrispettivi" TEXT,
ADD COLUMN     "fatturaImporto0" TEXT,
ADD COLUMN     "fatturaValutaEstera" TEXT,
ADD COLUMN     "generazioneAutofattura" TEXT,
ADD COLUMN     "gestioneIntrastat" TEXT,
ADD COLUMN     "gestionePartite" TEXT,
ADD COLUMN     "gestioneRitenuteEnasarco" TEXT,
ADD COLUMN     "identificativoEsteroClifor" TEXT,
ADD COLUMN     "ivaEsigibilitaDifferita" TEXT,
ADD COLUMN     "movimentoRegIvaNonRilevante" TEXT,
ADD COLUMN     "nonConsiderareLiquidazioneIva" TEXT,
ADD COLUMN     "nonStampareRegCronologico" TEXT,
ADD COLUMN     "noteMovimento" TEXT,
ADD COLUMN     "scritturaRettificaAssestamento" TEXT,
ADD COLUMN     "segnoMovimentoIva" TEXT,
ADD COLUMN     "tipoAggiornamento" TEXT,
ADD COLUMN     "tipoAutofatturaGenerata" TEXT,
ADD COLUMN     "tipoMovimento" TEXT,
ADD COLUMN     "tipoMovimentoSemplificata" TEXT,
ADD COLUMN     "tipoRegistroIva" TEXT,
ADD COLUMN     "versamentoRitenute" TEXT;

-- AlterTable
ALTER TABLE "staging_codici_iva" DROP COLUMN "codiceRegistro",
DROP COLUMN "esigibilita",
DROP COLUMN "naturaOperazione",
DROP COLUMN "norma",
DROP COLUMN "tipo",
DROP COLUMN "tipoOperazione",
ADD COLUMN     "acqOperazImponibiliOccasionali" TEXT,
ADD COLUMN     "acquistiCessioni" TEXT,
ADD COLUMN     "acquistiIntracomunitari" TEXT,
ADD COLUMN     "agevolazioniSubforniture" TEXT,
ADD COLUMN     "aliquotaDiversa" TEXT,
ADD COLUMN     "analiticoBeniAmmortizzabili" TEXT,
ADD COLUMN     "autofatturaReverseCharge" TEXT,
ADD COLUMN     "beniAmmortizzabili" TEXT,
ADD COLUMN     "cesArt38QuaterStornoIva" TEXT,
ADD COLUMN     "cessioneProdottiEditoriali" TEXT,
ADD COLUMN     "comunicazioneDatiIvaAcquisti" TEXT,
ADD COLUMN     "comunicazioneDatiIvaVendite" TEXT,
ADD COLUMN     "gestioneProRata" TEXT,
ADD COLUMN     "imponibile50Corrispettivi" TEXT,
ADD COLUMN     "imposteIntrattenimenti" TEXT,
ADD COLUMN     "indicatoreTerritorialeAcquisti" TEXT,
ADD COLUMN     "indicatoreTerritorialeVendite" TEXT,
ADD COLUMN     "metodoDaApplicare" TEXT,
ADD COLUMN     "monteAcquisti" TEXT,
ADD COLUMN     "noVolumeAffariPlafond" TEXT,
ADD COLUMN     "operazioneEsenteOccasionale" TEXT,
ADD COLUMN     "percDetrarreExport" TEXT,
ADD COLUMN     "percentualeCompensazione" TEXT,
ADD COLUMN     "percentualeForfetaria" TEXT,
ADD COLUMN     "plafondAcquisti" TEXT,
ADD COLUMN     "plafondVendite" TEXT,
ADD COLUMN     "provvigioniDm34099" TEXT,
ADD COLUMN     "quotaForfetaria" TEXT;

-- AlterTable
ALTER TABLE "staging_condizioni_pagamento" DROP COLUMN "codice",
DROP COLUMN "tipo",
DROP COLUMN "validitaFine",
DROP COLUMN "validitaInizio",
ADD COLUMN     "calcolaGiorniCommerciali" TEXT,
ADD COLUMN     "codicePagamento" TEXT,
ADD COLUMN     "consideraPeriodiChiusura" TEXT,
ADD COLUMN     "contoIncassoPagamento" TEXT,
ADD COLUMN     "inizioScadenza" TEXT,
ADD COLUMN     "numeroRate" TEXT,
ADD COLUMN     "suddivisione" TEXT;
