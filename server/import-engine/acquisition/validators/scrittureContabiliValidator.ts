import { z } from 'zod';

// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - VALIDATORI ZOD (REFACTORED)
// =============================================================================
// In questa versione, i validatori aderiscono al principio di "Staging Fedele".
// Il loro unico scopo è definire la struttura completa dei record letti dai
// file sorgente. Ogni campo viene validato come stringa.
//
// L'unica eccezione è la trasformazione dei campi "flag" (es. 'X', '1')
// in valori booleani, come da specifiche.
//
// La conversione di tipi (es. stringa -> data, stringa -> numero) è
// demandata alla fase di FINALIZZAZIONE.
// =============================================================================

// -----------------------------------------------------------------------------
// UTILITY DI VALIDAZIONE CONDIVISE
// -----------------------------------------------------------------------------

const flagTransform = z
  .string()
  .nullable()
  .optional()
  .transform((val) => {
    if (!val) return false;
    // Valori considerati 'true' secondo i tracciati e l'uso comune ('S' non è standard ma lo manteniamo per sicurezza)
    const trueValues = ['1', 'S', 'Y', 'T', 'X'];
    return trueValues.includes(val.trim().toUpperCase());
  });

// -----------------------------------------------------------------------------
// VALIDATORI PER OGNI FILE
// -----------------------------------------------------------------------------

/**
 * PNTESTA.TXT - Testate delle scritture contabili
 * Definisce TUTTI i campi del tracciato come stringhe.
 */
export const rawPnTestaSchema = z.object({
  // Identificativi
  externalId: z.string().optional(), // CODICE UNIVOCO DI SCARICAMENTO
  codiceFiscaleAzienda: z.string().optional(),
  subcodiceFiscaleAzienda: z.string().optional(),
  esercizio: z.string().optional(),
  codiceAttivita: z.string().optional(),

  // Dati Causale
  causaleId: z.string().optional(), // CODICE CAUSALE
  descrizioneCausale: z.string().optional(),

  // Dati Registrazione e Documento
  dataRegistrazione: z.string().optional(),
  dataDocumento: z.string().optional(),
  numeroDocumento: z.string().optional(),
  documentoBis: z.string().optional(),
  totaleDocumento: z.string().optional(),

  // Dati IVA
  codiceAttivitaIva: z.string().optional(),
  tipoRegistroIva: z.string().optional(),
  codiceNumerazioneIva: z.string().optional(),
  dataRegistroIva: z.string().optional(),
  protocolloNumero: z.string().optional(),
  protocolloBis: z.string().optional(),
  dataCompetenzaLiquidIva: z.string().optional(),

  // Dati Cliente/Fornitore
  clienteFornitoreCodiceFiscale: z.string().optional(),
  clienteFornitoreSubcodice: z.string().optional(),
  clienteFornitoreSigla: z.string().optional(),

  // Dati Competenza e Note
  dataCompetenzaContabile: z.string().optional(),
  noteMovimento: z.string().optional(),

  // Altri Dati
  dataPlafond: z.string().optional(),
  annoProRata: z.string().optional(),

  // Ritenute
  ritenute: z.string().optional(),
  enasarco: z.string().optional(),

  // Valuta Estera
  totaleInValuta: z.string().optional(),
  codiceValuta: z.string().optional(),

  // Autofattura
  codiceNumerazioneIvaVendite: z.string().optional(),
  protocolloNumeroAutofattura: z.string().optional(),
  protocolloBisAutofattura: z.string().optional(),

  // Versamento Ritenute
  versamentoData: z.string().optional(),
  versamentoTipo: z.string().optional(),
  versamentoModello: z.string().optional(),
  versamentoEstremi: z.string().optional(),

  // Dati di Servizio e Partite
  stato: z.string().optional(),
  tipoGestionePartite: z.string().optional(),
  codicePagamento: z.string().optional(),

  // Dati Partita di Riferimento
  codiceAttivitaIvaPartita: z.string().optional(),
  tipoRegistroIvaPartita: z.string().optional(),
  codiceNumerazioneIvaPartita: z.string().optional(),
  cliForCodiceFiscalePartita: z.string().optional(),
  cliForSubcodicePartita: z.string().optional(),
  cliForSiglaPartita: z.string().optional(),
  documentoDataPartita: z.string().optional(),
  documentoNumeroPartita: z.string().optional(),
  documentoBisPartita: z.string().optional(),

  // Dati Intrastat
  cliForIntraCodiceFiscale: z.string().optional(),
  cliForIntraSubcodice: z.string().optional(),
  cliForIntraSigla: z.string().optional(),
  tipoMovimentoIntrastat: z.string().optional(),
  documentoOperazione: z.string().optional(),
});

/**
 * PNRIGCON.TXT - Righe contabili
 * Definisce TUTTI i campi del tracciato, applicando la trasformazione booleana ai campi flag.
 */
export const rawPnRigConSchema = z.object({
  // Identificativi
  externalId: z.string().optional(), // CODICE UNIVOCO DI SCARICAMENTO
  progressivoRigo: z.string().optional(),

  // Dati Conto
  tipoConto: z.string().optional(),
  conto: z.string().optional(),
  siglaConto: z.string().optional(),

  // Dati Cliente/Fornitore di Riga
  clienteFornitoreCodiceFiscale: z.string().optional(),
  clienteFornitoreSubcodice: z.string().optional(),
  clienteFornitoreSigla: z.string().optional(),

  // Importi
  importoDare: z.string().optional(),
  importoAvere: z.string().optional(),

  // Note
  note: z.string().optional(),
  noteDiCompetenza: z.string().optional(),

  // Dati Competenza Contabile
  insDatiCompetenzaContabile: flagTransform,
  dataInizioCompetenza: z.string().optional(),
  dataFineCompetenza: z.string().optional(),
  dataRegistrazioneApertura: z.string().optional(),

  // Conti da Rilevare (Facoltativi)
  contoDaRilevareMovimento1: z.string().optional(),
  contoDaRilevareMovimento2: z.string().optional(),

  // Dati Movimenti Analitici
  insDatiMovimentiAnalitici: flagTransform,
  dataInizioCompetenzaAnalit: z.string().optional(),
  dataFineCompetenzaAnalit: z.string().optional(),

  // Dati Studi di Settore
  insDatiStudiDiSettore: flagTransform,
  statoMovimentoStudi: z.string().optional(),
  esercizioDiRilevanzaFiscale: z.string().optional(),

  // Dettaglio Cliente/Fornitore
  dettaglioCliForCodiceFiscale: z.string().optional(),
  dettaglioCliForSubcodice: z.string().optional(),
  dettaglioCliForSigla: z.string().optional(),
});

/**
 * PNRIGIVA.TXT - Righe IVA
 * Definisce TUTTI i campi del tracciato come stringhe.
 */
export const rawPnRigIvaSchema = z.object({
  // Identificativi
  codiceUnivocoScaricamento: z.string().optional(), // CODICE UNIVOCO DI SCARICAMENTO
  externalId: z.string().optional(), // Legacy compatibility

  // Dati IVA
  codiceIva: z.string().optional(),
  imponibile: z.string().optional(),
  imposta: z.string().optional(),
  impostaIntrattenimenti: z.string().optional(),
  imponibile50CorrNonCons: z.string().optional(),
  impostaNonConsiderata: z.string().optional(),
  importoLordo: z.string().optional(),

  // Dati Contropartita
  contropartita: z.string().optional(),
  siglaContropartita: z.string().optional(),

  // Note
  note: z.string().optional(),
});

/**
 * MOVANAC.TXT - Dettagli per centri di costo/ricavo (movimenti analitici)
 * Definisce TUTTI i campi del tracciato come stringhe.
 */
export const rawMovAnacSchema = z.object({
  // Identificativi
  externalId: z.string().optional(), // CODICE UNIVOCO DI SCARICAMENTO
  progressivoRigoContabile: z.string().optional(),

  // Dati Allocazione
  centroDiCosto: z.string().optional(),
  parametro: z.string().optional(),
});