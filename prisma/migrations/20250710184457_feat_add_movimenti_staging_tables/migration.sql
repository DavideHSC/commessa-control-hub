-- CreateTable
CREATE TABLE "staging_testate" (
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

    CONSTRAINT "staging_testate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staging_righe_contabili" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "progressivoNumeroRigo" TEXT NOT NULL,
    "tipoConto" TEXT,
    "clienteFornitoreCodiceFiscale" TEXT,
    "clienteFornitoreSubcodice" TEXT,
    "clienteFornitoreSigla" TEXT,
    "conto" TEXT,
    "importoDare" TEXT,
    "importoAvere" TEXT,
    "note" TEXT,
    "insDatiCompetenzaContabile" TEXT,
    "dataInizioCompetenza" TEXT,
    "dataFineCompetenza" TEXT,
    "noteDiCompetenza" TEXT,
    "dataRegistrazioneApertura" TEXT,
    "contoDaRilevareMovimento1" TEXT,
    "contoDaRilevareMovimento2" TEXT,
    "insDatiMovimentiAnalitici" TEXT,
    "dataInizioCompetenzaAnalitica" TEXT,
    "dataFineCompetenzaAnalitica" TEXT,
    "insDatiStudiDiSettore" TEXT,
    "statoMovimentoStudi" TEXT,
    "esercizioDiRilevanzaFiscale" TEXT,
    "dettaglioCliForCodiceFiscale" TEXT,
    "dettaglioCliForSubcodice" TEXT,
    "dettaglioCliForSigla" TEXT,
    "siglaConto" TEXT,
    "sourceFileName" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staging_righe_contabili_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staging_righe_iva" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "rigaIdentifier" TEXT NOT NULL,
    "codiceIva" TEXT,
    "contropartita" TEXT,
    "imponibile" TEXT,
    "imposta" TEXT,
    "impostaIntrattenimenti" TEXT,
    "imponibile50CorrNonCons" TEXT,
    "impostaNonConsiderata" TEXT,
    "importoLordo" TEXT,
    "note" TEXT,
    "siglaContropartita" TEXT,
    "sourceFileName" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staging_righe_iva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staging_allocazioni" (
    "id" TEXT NOT NULL,
    "codiceUnivocoScaricamento" TEXT NOT NULL,
    "progressivoNumeroRigoCont" TEXT NOT NULL,
    "allocazioneIdentifier" TEXT NOT NULL,
    "centroDiCosto" TEXT,
    "parametro" TEXT,
    "sourceFileName" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staging_allocazioni_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staging_testate_codiceUnivocoScaricamento_key" ON "staging_testate"("codiceUnivocoScaricamento");

-- CreateIndex
CREATE UNIQUE INDEX "staging_righe_contabili_codiceUnivocoScaricamento_progressi_key" ON "staging_righe_contabili"("codiceUnivocoScaricamento", "progressivoNumeroRigo");

-- CreateIndex
CREATE UNIQUE INDEX "staging_righe_iva_rigaIdentifier_key" ON "staging_righe_iva"("rigaIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "staging_allocazioni_allocazioneIdentifier_key" ON "staging_allocazioni"("allocazioneIdentifier");
