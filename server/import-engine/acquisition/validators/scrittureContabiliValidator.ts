import { z } from 'zod';
import moment from 'moment';

// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - VALIDATORI ZOD
// =============================================================================
// Questo è il parser più complesso (⭐⭐⭐⭐⭐) che gestisce 4 file interconnessi:
// - PNTESTA.TXT: Testate delle scritture contabili
// - PNRIGCON.TXT: Righe contabili (movimenti Dare/Avere)
// - PNRIGIVA.TXT: Righe IVA per operazioni fiscalmente rilevanti
// - MOVANAC.TXT: Allocazioni analitiche su centri di costo/commesse
//
// SFIDA: Coordinare parsing, validazione e correlazione multi-file
// mantenendo integrità referenziale assoluta
// =============================================================================

// -----------------------------------------------------------------------------
// UTILITY DI VALIDAZIONE CONDIVISE
// // NUOVO: Per file con decimali espliciti (prima nota)
const currencyTransformPrimaNota = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return 0;
    const cleaned = val.trim().replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  });

// ESISTENTE: Per file con decimali impliciti (mantenuto per altri file)
const currencyTransformGenerico = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return 0;
    const cleaned = val.trim().replace(',', '.');
    if (!cleaned.includes('.')) {
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? 0 : parsed / 100;
    }
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  });

const dateTransform = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '00000000' || val.trim() === '') return null;
    const parsedDate = moment(val, 'DDMMYYYY', true);
    return parsedDate.isValid() ? parsedDate.toDate() : null;
  });

const flagTransform = z
  .string()
  .nullable()
  .optional()
  .transform((val) => {
    if (!val) return false;
    const trueValues = ['1', 's', 'y', 't'];
    return trueValues.includes(val.trim().toLowerCase());
  });

// -----------------------------------------------------------------------------
// VALIDATORI PER OGNI FILE
// -----------------------------------------------------------------------------

/**
 * PNTESTA.TXT - Testate delle scritture contabili
 * Rappresenta l'intestazione di ogni registrazione contabile
 */
export const rawPnTestaSchema = z.object({
  externalId: z.string(),

  // Campi dal tracciato, richiesti per il mapping
  esercizio: z.string().optional(),
  codiceFiscaleAzienda: z.string().optional(),
  codiceAttivita: z.string().optional(),
  causaleId: z.string(),
  protocolloNumero: z.string().optional(),

  // Campi già presenti
  dataRegistrazione: z.string().nullable(),
  clienteFornitoreCodiceFiscale: z.string(),
  dataDocumento: z.string().nullable(),
  numeroDocumento: z.string(),
  totaleDocumento: z.string().nullable(),
  noteMovimento: z.string(),
  dataRegistroIva: z.string().nullable(),
  dataCompetenzaLiquidIva: z.string().nullable(),
  dataCompetenzaContabile: z.string().optional(),
  dataPlafond: z.string().optional(),
  annoProRata: z.string().optional(),
  ritenute: z.string().nullable(),
  enasarco: z.string().nullable(),
  totaleInValuta: z.string().nullable(),
  versamentoData: z.string().nullable(),
  documentoDataPartita: z.string().nullable(),
  documentoOperazione: z.string().optional(),
  descrizioneCausale: z.string().optional(),
  clienteFornitoreSigla: z.string().optional(),
  cliForIntraSigla: z.string().optional(),
  tipoMovimentoIntrastat: z.string().optional(),
  tipoRegistroIva: z.string().optional(), // Aggiunto per coerenza
});

export const validatedPnTestaSchema = z.object({
  externalId: z.string().trim().min(1, 'External ID richiesto'),

  // Campi aggiunti per il workflow
  esercizio: z.string().trim().optional(),
  codiceFiscaleAzienda: z.string().trim().optional(),
  codiceAttivita: z.string().trim().optional(),
  protocolloNumero: z.string().trim().optional(),
  
  causaleId: z.string().trim().optional(),
  descrizioneCausale: z.string().trim().optional(),
  dataRegistrazione: dateTransform,
  clienteFornitoreCodiceFiscale: z.string().trim().optional(),
  dataDocumento: dateTransform,
  numeroDocumento: z.string().trim().optional(),
  totaleDocumento: currencyTransformPrimaNota,
  noteMovimento: z.string().trim().optional(),
  dataRegistroIva: dateTransform,
  dataCompetenzaLiquidIva: dateTransform,
  dataCompetenzaContabile: dateTransform,
  dataPlafond: dateTransform,
  annoProRata: z.string().nullable(),
  ritenute: currencyTransformPrimaNota,
  enasarco: currencyTransformPrimaNota,
  totaleInValuta: currencyTransformPrimaNota,
  versamentoData: dateTransform,
  documentoDataPartita: dateTransform,
  documentoOperazione: dateTransform,
  clienteFornitoreSigla: z.string().trim().optional(),
  cliForIntraSigla: z.string().trim().optional(),
  tipoMovimentoIntrastat: z.string().trim().optional(),
  tipoRegistroIva: z.string().trim().optional(),
}).passthrough();

/**
 * PNRIGCON.TXT - Righe contabili
 * Ogni riga rappresenta un movimento Dare/Avere su un conto
 */
export const rawPnRigConSchema = z.object({
  externalId: z.string(),
  progressivoRigo: z.string().optional(),
  tipoConto: z.string().optional(),
  clienteFornitoreCodiceFiscale: z.string().optional(),
  clienteFornitoreSubcodice: z.string().optional(),
  clienteFornitoreSigla: z.string().optional(),
  conto: z.string().optional(),
  importoDare: z.string().optional(),
  importoAvere: z.string().optional(),
  note: z.string().optional(),
  insDatiCompetenzaContabile: z.string().optional(),
  dataInizioCompetenza: z.string().optional(),
  dataFineCompetenza: z.string().optional(),
  dataRegistrazioneApertura: z.string().nullable(),
  dataInizioCompetenzaAnalit: z.string().nullable(),
  dataFineCompetenzaAnalit: z.string().nullable(),
  // impostaNonConsiderata: z.string().optional(),
  // importoLordo: z.string().optional(),
  // siglaContropartita: z.string().optional(),
});

export const validatedPnRigConSchema = z.object({
  externalId: z.string().trim().min(1, 'External ID richiesto'),
  progressivoRigo: z.string().nullable().transform((val) => val ?? '0'),
  tipoConto: z.string().trim().optional(),
  clienteFornitoreCodiceFiscale: z.string().trim().optional(),
  clienteFornitoreSubcodice: z.string().trim().optional(),
  clienteFornitoreSigla: z.string().trim().optional(),
  conto: z.string().trim().optional(),
  importoDare: currencyTransformPrimaNota,
  importoAvere: currencyTransformPrimaNota,
  note: z.string().trim().optional(),
  insDatiCompetenzaContabile: flagTransform,
  // impostaNonConsiderata: z.string().trim().optional(),
  // importoLordo: currencyTransformPrimaNota,
  // siglaContropartita: z.string().trim().optional(),
}).passthrough();

/**
 * PNRIGIVA.TXT - Righe IVA
 * Ogni riga rappresenta un dettaglio IVA della registrazione
 */
export const rawPnRigIvaSchema = z.object({
  externalId: z.string(),
  codiceIva: z.string().optional(),
  imponibile: z.string().optional(),
  imposta: z.string().optional(),
  importoLordo: z.string().optional(),
  impostaNonConsiderata: z.string().optional(),
  // riga: z.string().trim(), // RIMOSSO - non esiste nel file, verrà calcolato
  note: z.string().optional(),
  contropartita: z.string().optional(),
  siglaContropartita: z.string().optional(),
});

export const validatedPnRigIvaSchema = z.object({
  externalId: z.string().trim().min(1, 'External ID richiesto'),
  codiceIva: z.string().trim().optional(),
  imponibile: currencyTransformPrimaNota,
  imposta: currencyTransformPrimaNota,
  importoLordo: currencyTransformPrimaNota,
  impostaNonConsiderata: currencyTransformPrimaNota,
  note: z.string().trim().optional(),
  contropartita: z.string().trim().optional(),
  siglaContropartita: z.string().trim().optional(),
}).passthrough();

/**
 * MOVANAC.TXT - Dettagli per centri di costo/ricavo (movimenti analitici)
 * Gestisce l'allocazione dei costi/ricavi sui centri di costo (commesse)
 */
export const rawMovAnacSchema = z.object({
  externalId: z.string(),
  progressivoRigoContabile: z.string().nullable(),
  centroDiCosto: z.string(),
  parametro: z.string().nullable(),
});

export const validatedMovAnacSchema = z.object({
  externalId: z.string().trim().min(1, 'External ID richiesto'),
  progressivoRigoContabile: z.string().nullable().transform((val) => val ? parseInt(val, 10) : 0),
  centroDiCosto: z.string().trim().optional(),
  parametro: currencyTransformPrimaNota,
});

// -----------------------------------------------------------------------------
// TIPI ESPORTATI
// -----------------------------------------------------------------------------

export type RawPnTesta = z.infer<typeof rawPnTestaSchema>;
export type ValidatedPnTesta = z.infer<typeof validatedPnTestaSchema>;
export type RawPnRigCon = z.infer<typeof rawPnRigConSchema>;
export type ValidatedPnRigCon = z.infer<typeof validatedPnRigConSchema>;
export type RawPnRigIva = z.infer<typeof rawPnRigIvaSchema>;
export type ValidatedPnRigIva = z.infer<typeof validatedPnRigIvaSchema>;
export type RawMovAnac = z.infer<typeof rawMovAnacSchema>;
export type ValidatedMovAnac = z.infer<typeof validatedMovAnacSchema>;

// -----------------------------------------------------------------------------
// STRUTTURE AGGREGATE PER COORDINAMENTO MULTI-FILE
// -----------------------------------------------------------------------------

/**
 * Rappresenta una scrittura contabile completa con tutte le sue componenti
 * Utilizzata dal transformer per gestire la correlazione multi-file
 */
export interface ScritturaContabileCompleta {
  testata: ValidatedPnTesta;
  righeContabili: ValidatedPnRigCon[];
  righeIva: ValidatedPnRigIva[];
  allocazioni: ValidatedMovAnac[];
}

/**
 * Mappa per organizzare i dati multi-file per codice univoco
 */
export interface ScrittureMultiFileMap {
  testate: Map<string, ValidatedPnTesta>;
  righeContabili: Map<string, ValidatedPnRigCon[]>;
  righeIva: Map<string, ValidatedPnRigIva[]>;
  allocazioni: Map<string, ValidatedMovAnac[]>;
}