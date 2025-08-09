// ATTENZIONE: Questo file è generato automaticamente. NON MODIFICARE A MANO.
// Eseguire 'npm run generate:import-types' per rigenerarlo.

export interface RawPianoDeiContiAziendale {
  filler_1: string;
  codiceFiscaleAzienda: string;
  subcodiceAzienda: string;
  tabellaItalstudio: string;
  livello: string;
  codice: string;
  tipo: string;
  descrizione: string;
  sigla: string;
  controlloSegno: string;
  contoCostiRicavi: string;
  validoImpresaOrdinaria: string;
  validoImpresaSemplificata: string;
  validoProfessionistaOrdinario: string;
  validoProfessionistaSemplificato: string;
  validoUnicoPf: string;
  validoUnicoSp: string;
  validoUnicoSc: string;
  validoUnicoEnc: string;
  classeIrpefIres: string;
  classeIrap: string;
  classeProfessionista: string;
  classeIrapProfessionista: string;
  classeIva: string;
  classeDatiStudiSettore: string;
  colonnaRegistroCronologico: string;
  colonnaRegistroIncassiPagamenti: string;
  contoDareCee: string;
  contoAvereCee: string;
  naturaConto: string;
  gestioneBeniAmmortizzabili: string;
  percDeduzioneManutenzione: string;
  gruppo: string;
  dettaglioClienteFornitore: string;
  descrizioneBilancioDare: string;
  descrizioneBilancioAvere: string;
  utilizzaDescrizioneLocale: string;
  descrizioneLocale: string;
  consideraBilancioSemplificato: string;
}

export interface RawCausali {
  codiceCausale: string;
  descrizione: string;
  tipoMovimento: string;
  tipoAggiornamento: string;
  dataInizio: string;
  dataFine: string;
  tipoRegistroIva: string;
  segnoMovimentoIva: string;
  contoIva: string;
  generazioneAutofattura: string;
  tipoAutofatturaGenerata: string;
  contoIvaVendite: string;
  fatturaImporto0: string;
  fatturaValutaEstera: string;
  nonConsiderareLiquidazioneIva: string;
  ivaEsigibilitaDifferita: string;
  fatturaEmessaRegCorrispettivi: string;
  gestionePartite: string;
  gestioneIntrastat: string;
  gestioneRitenuteEnasarco: string;
  versamentoRitenute: string;
  noteMovimento: string;
  descrizioneDocumento: string;
  identificativoEsteroClifor: string;
  scritturaRettificaAssestamento: string;
  nonStampareRegCronologico: string;
  movimentoRegIvaNonRilevante: string;
  tipoMovimentoSemplificata: string;
}

export interface RawCondizioniPagamento {
  codicePagamento: string;
  descrizione: string;
  contoIncassoPagamento: string;
  calcolaGiorniCommerciali: string;
  consideraPeriodiChiusura: string;
  suddivisione: string;
  inizioScadenza: string;
  numeroRate: string;
}

export interface RawCodiciIva {
  codice: string;
  descrizione: string;
  tipoCalcolo: string;
  aliquota: string;
  indetraibilita: string;
  note: string;
  validitaInizio: string;
  validitaFine: string;
  imponibile50Corrispettivi: string;
  imposteIntrattenimenti: string;
  ventilazione: string;
  aliquotaDiversa: string;
  plafondAcquisti: string;
  monteAcquisti: string;
  plafondVendite: string;
  noVolumeAffariPlafond: string;
  gestioneProRata: string;
  acqOperazImponibiliOccasionali: string;
  comunicazioneDatiIvaVendite: string;
  agevolazioniSubforniture: string;
  comunicazioneDatiIvaAcquisti: string;
  autofatturaReverseCharge: string;
  operazioneEsenteOccasionale: string;
  cesArt38QuaterStornoIva: string;
  percDetrarreExport: string;
  acquistiCessioni: string;
  percentualeCompensazione: string;
  beniAmmortizzabili: string;
  indicatoreTerritorialeVendite: string;
  provvigioniDm34099: string;
  indicatoreTerritorialeAcquisti: string;
  metodoDaApplicare: string;
  percentualeForfetaria: string;
  analiticoBeniAmmortizzabili: string;
  quotaForfetaria: string;
  acquistiIntracomunitari: string;
  cessioneProdottiEditoriali: string;
}

export interface RawPianoDeiConti {
  livello: string;
  codice: string;
  descrizione: string;
  tipo: string;
  sigla: string;
  controlloSegno: string;
  contoCostiRicavi: string;
  validoImpresaOrdinaria: string;
  validoImpresaSemplificata: string;
  validoProfessionistaOrdinario: string;
  validoProfessionistaSemplificato: string;
  validoUnicoPf: string;
  validoUnicoSp: string;
  validoUnicoSc: string;
  validoUnicoEnc: string;
  classeIrpefIres: string;
  classeIrap: string;
  classeProfessionista: string;
  classeIrapProfessionista: string;
  classeIva: string;
  colonnaRegistroCronologico: string;
  colonnaRegistroIncassiPagamenti: string;
  contoDareCee: string;
  contoAvereCee: string;
  naturaConto: string;
  gestioneBeniAmmortizzabili: string;
  percDeduzioneManutenzione: string;
  gruppo: string;
  classeDatiExtracontabili: string;
  dettaglioClienteFornitore: string;
  descrizioneBilancioDare: string;
  descrizioneBilancioAvere: string;
}

export interface RawScrittureContabili {
  externalId: string;
  riga: string;
  progressivoRigo: string;
  progressivoRigoContabile: string;
  centroDiCosto: string;
  tipoConto: string;
  codiceIva: string;
  clienteFornitoreCodiceFiscale: string;
  parametro: string;
  contropartita: string;
  imponibile: string;
  causaleId: string;
  imposta: string;
  conto: string;
  importoDare: string;
  importoAvere: string;
  note: string;
  dataRegistrazione: string;
  importoLordo: string;
  dataDocumento: string;
  numeroDocumento: string;
  totaleDocumento: string;
  noteMovimento: string;
  movimentiAnalitici: string;
}

export interface RawAnagraficaClifor {
  CODICE_FISCALE_AZIENDA: string;
  SUBCODICE_AZIENDA: string;
  CODICE_UNIVOCO: string;
  CODICE_FISCALE_CLIFOR: string;
  SUBCODICE_CLIFOR: string;
  TIPO_CONTO: string;
  SOTTOCONTO_CLIENTE: string;
  SOTTOCONTO_FORNITORE: string;
  CODICE_ANAGRAFICA: string;
  PARTITA_IVA: string;
  TIPO_SOGGETTO: string;
  DENOMINAZIONE: string;
  cognome: string;
  nome: string;
  sesso: string;
  dataNascita: string;
  comuneNascita: string;
  comuneResidenza: string;
  cap: string;
  indirizzo: string;
  prefissoTelefono: string;
  numeroTelefono: string;
  idFiscaleEstero: string;
  codiceIso: string;
  codiceIncassoPagamento: string;
  codiceIncassoCliente: string;
  codicePagamentoFornitore: string;
  codiceValuta: string;
  gestioneDati770: string;
  soggettoARitenuta: string;
  quadro770: string;
  contributoPrevidenziale: string;
  codiceRitenuta: string;
  enasarco: string;
  tipoRitenuta: string;
  soggettoInail: string;
  contributoPrevid335: string;
  aliquota: string;
  percContributoCassa: string;
  attivitaMensilizzazione: string;
}

