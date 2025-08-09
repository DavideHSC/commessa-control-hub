/*
  Warnings:

  - You are about to drop the `staging_testate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "staging_testate";

-- CreateTable
CREATE TABLE "StagingTestata" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "codiceFiscaleAzienda" TEXT,
    "subcodiceFiscaleAzienda" TEXT,
    "codiceAttivita" TEXT,
    "esercizio" TEXT,
    "codiceCausale" TEXT,
    "descrizioneCausale" TEXT,
    "dataRegistrazione" TEXT,
    "codiceAttivitaIva" TEXT,
    "tipoRegistroIva" TEXT,
    "codiceNumerazioneIva" TEXT,
    "clienteFornitoreCodiceFiscale" TEXT,
    "clienteFornitoreSubcodice" TEXT,
    "clienteFornitoreSigla" TEXT,
    "documentoData" TEXT,
    "documentoNumero" TEXT,
    "documentoBis" TEXT,
    "dataRegistroIva" TEXT,
    "protocolloNumero" TEXT,
    "protocolloBis" TEXT,
    "dataCompetenzaLiquidIva" TEXT,
    "totaleDocumento" TEXT,
    "dataCompetenzaContabile" TEXT,
    "noteMovimento" TEXT,
    "dataPlafond" TEXT,
    "annoProRata" TEXT,
    "ritenute" TEXT,
    "enasarco" TEXT,
    "totaleInValuta" TEXT,
    "codiceValuta" TEXT,
    "codiceNumerazioneIvaVendite" TEXT,
    "protocolloNumeroAutofattura" TEXT,
    "protocolloBisAutofattura" TEXT,
    "versamentoData" TEXT,
    "versamentoTipo" TEXT,
    "versamentoModello" TEXT,
    "versamentoEstremi" TEXT,
    "stato" TEXT,
    "tipoGestionePartite" TEXT,
    "codicePagamento" TEXT,
    "codiceAttivitaIvaPartita" TEXT,
    "tipoRegistroIvaPartita" TEXT,
    "codiceNumerazioneIvaPartita" TEXT,
    "cliForCodiceFiscalePartita" TEXT,
    "cliForSubcodicePartita" TEXT,
    "cliForSiglaPartita" TEXT,
    "documentoDataPartita" TEXT,
    "documentoNumeroPartita" TEXT,
    "documentoBisPartita" TEXT,
    "cliForIntraCodiceFiscale" TEXT,
    "cliForIntraSubcodice" TEXT,
    "cliForIntraSigla" TEXT,
    "tipoMovimentoIntrastat" TEXT,
    "documentoOperazione" TEXT,
    "sourceFileName" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StagingTestata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staging_codici_iva" (
    "id" TEXT NOT NULL,
    "codice" TEXT,
    "descrizione" TEXT,
    "aliquota" TEXT,
    "codiceRegistro" TEXT,
    "tipo" TEXT,
    "ventilazione" TEXT,
    "tipoOperazione" TEXT,
    "naturaOperazione" TEXT,
    "esigibilita" TEXT,
    "norma" TEXT,
    "validitaInizio" TEXT,
    "validitaFine" TEXT,

    CONSTRAINT "staging_codici_iva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staging_anagrafiche" (
    "id" TEXT NOT NULL,
    "codice" TEXT,
    "descrizione" TEXT,
    "codiceRegistro" TEXT,
    "tipo" TEXT,
    "validitaInizio" TEXT,
    "validitaFine" TEXT,

    CONSTRAINT "staging_anagrafiche_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StagingTestata_codiceUnivocoScaricamento_key" ON "StagingTestata"("codiceUnivocoScaricamento");

-- AddForeignKey
ALTER TABLE "staging_righe_contabili" ADD CONSTRAINT "staging_righe_contabili_codiceUnivocoScaricamento_fkey" FOREIGN KEY ("codiceUnivocoScaricamento") REFERENCES "StagingTestata"("codiceUnivocoScaricamento") ON DELETE CASCADE ON UPDATE CASCADE;
