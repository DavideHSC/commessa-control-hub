// ATTENZIONE: Questo file è generato automaticamente. NON MODIFICARE A MANO.
// Eseguire 'npm run generate:import-types' per rigenerarlo.

export interface RawScrittureContabili {
  externalId: string;
  externalId: string;
  externalId: string;
  progressivoRigo: string;
  progressivoRigoContabile: string;
  codiceIva: string;
  tipoConto: string;
  centroDiCosto: string;
  contropartita: string;
  clienteFornitoreCodiceFiscale: string;
  externalId: string;
  parametro: string;
  imponibile: string;
  causaleId: string;
  imposta: string;
  conto: string;
  importoDare: string;
  importoAvere: string;
  note: string;
  dataRegistrazione: string;
  importoLordo: string;
  clienteFornitoreCodiceFiscale: string;
  note: string;
  dataDocumento: string;
  numeroDocumento: string;
  totaleDocumento: string;
  noteMovimento: string;
  movimentiAnalitici: string;
}

export interface RawPntesta {
  codiceUnivocoScaricamento: string;
  codiceCausale: string;
  descrizioneCausale: string;
  dataRegistrazione: string;
  tipoRegistroIva: string;
  clienteFornitoreCodiceFiscale: string;
  clienteFornitoreSigla: string;
  dataDocumento: string;
  numeroDocumento: string;
  protocolloNumero: string;
  totaleDocumento: string;
  noteMovimento: string;
}

export interface RawPnrigcon {
  codiceUnivocoScaricamento: string;
  progressivoRiga: string;
  tipoConto: string;
  codiceFiscale: string;
  subcodiceFiscale: string;
  siglaClienteFornitore: string;
  conto: string;
  importoDare: string;
  importoAvere: string;
  note: string;
  insDatiMovimentiAnalitici: string;
}

export interface RawPnrigiva {
  codiceUnivocoScaricamento: string;
  codiceIva: string;
  contropartita: string;
  imponibile: string;
  imposta: string;
  importoLordo: string;
  note: string;
  siglaContropartita: string;
}

export interface RawMovanac {
  codiceUnivocoScaricamento: string;
  progressivoRigaContabile: string;
  centroDiCosto: string;
  parametro: string;
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

export interface RawAnagraficaClifor {
  codiceFiscaleAzienda: string;
  subcodiceAzienda: string;
  codiceUnivoco: string;
  codiceFiscaleClifor: string;
  subcodiceClifor: string;
  tipoConto: string;
  sottocontoCliente: string;
  sottocontoFornitore: string;
  codiceAnagrafica: string;
  partitaIva: string;
  tipoSoggetto: string;
  denominazione: string;
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

