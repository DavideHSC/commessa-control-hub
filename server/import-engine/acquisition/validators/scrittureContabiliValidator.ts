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
// -----------------------------------------------------------------------------

const dateTransform = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '00000000' || val.trim() === '') return null;
    const parsedDate = moment(val, 'DDMMYYYY', true);
    return parsedDate.isValid() ? parsedDate.toDate() : null;
  });

const currencyTransform = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return 0;
    const cleaned = val.trim().replace(',', '.');
    // Handle implicit decimals (e.g., "12345" -> 123.45)
    if (!cleaned.includes('.')) {
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? 0 : parsed / 100;
    }
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
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
  causaleId: z.string(),
  dataRegistrazione: z.string().nullable(),
  clienteFornitoreCodiceFiscale: z.string(),
  dataDocumento: z.string().nullable(),
  numeroDocumento: z.string(),
  totaleDocumento: z.string().nullable(),
  noteMovimento: z.string(),
  dataRegistroIva: z.string().nullable(),
  dataCompetenzaLiquidIva: z.string().nullable(),
  dataCompetenzaContabile: z.string().nullable(),
  dataPlafond: z.string().nullable(),
  annoProRata: z.string().nullable(),
  ritenute: z.string().nullable(),
  enasarco: z.string().nullable(),
  totaleInValuta: z.string().nullable(),
  versamentoData: z.string().nullable(),
  documentoDataPartita: z.string().nullable(),
  documentoOperazione: z.string().nullable(),
});

export const validatedPnTestaSchema = z.object({
  externalId: z.string().trim().min(1, 'External ID richiesto'),
  causaleId: z.string().trim(),
  dataRegistrazione: dateTransform,
  clienteFornitoreCodiceFiscale: z.string().trim().optional(),
  dataDocumento: dateTransform,
  numeroDocumento: z.string().trim().optional(),
  totaleDocumento: currencyTransform,
  noteMovimento: z.string().trim().optional(),
  dataRegistroIva: dateTransform,
  dataCompetenzaLiquidIva: dateTransform,
  dataCompetenzaContabile: dateTransform,
  dataPlafond: dateTransform,
  annoProRata: z.string().nullable(),
  ritenute: currencyTransform,
  enasarco: currencyTransform,
  totaleInValuta: currencyTransform,
  versamentoData: dateTransform,
  documentoDataPartita: dateTransform,
  documentoOperazione: dateTransform,
}).passthrough();

/**
 * PNRIGCON.TXT - Righe contabili
 * Ogni riga rappresenta un movimento Dare/Avere su un conto
 */
export const rawPnRigConSchema = z.object({
  externalId: z.string(),
  progressivoRigo: z.string().nullable(),
  tipoConto: z.string(),
  clienteFornitoreCodiceFiscale: z.string(),
  conto: z.string(),
  importoDare: z.string().nullable(),
  importoAvere: z.string().nullable(),
  note: z.string(),
  insDatiMovimentiAnalitici: z.string().nullable(),
  dataInizioCompetenza: z.string().nullable(),
  dataFineCompetenza: z.string().nullable(),
  dataRegistrazioneApertura: z.string().nullable(),
  dataInizioCompetenzaAnalit: z.string().nullable(),
  dataFineCompetenzaAnalit: z.string().nullable(),
});

export const validatedPnRigConSchema = z.object({
  externalId: z.string().trim().min(1, 'External ID richiesto'),
  progressivoRigo: z.string().nullable().transform((val) => val ?? '0'),
  tipoConto: z.string().trim().optional(),
  clienteFornitoreCodiceFiscale: z.string().trim().optional(),
  conto: z.string().trim().optional(),
  importoDare: currencyTransform,
  importoAvere: currencyTransform,
  note: z.string().trim().optional(),
  insDatiMovimentiAnalitici: flagTransform,
});

/**
 * PNRIGIVA.TXT - Righe IVA
 * Gestisce gli aspetti fiscali delle operazioni
 */
export const rawPnRigIvaSchema = z.object({
  externalId: z.string(),
  codiceIva: z.string(),
  contropartita: z.string(),
  imponibile: z.string().nullable(),
  imposta: z.string().nullable(),
  importoLordo: z.string().nullable(),
  note: z.string(),
  riga: z.string().nullable(),
});

export const validatedPnRigIvaSchema = z.object({
  externalId: z.string().trim().min(1, 'External ID richiesto'),
  riga: z.string().trim(),
  codiceIva: z.string().trim().optional(),
  contropartita: z.string().trim().optional(),
  imponibile: currencyTransform,
  imposta: currencyTransform,
  importoLordo: currencyTransform,
  note: z.string().trim().optional(),
});

/**
 * MOVANAC.TXT - Movimenti analitici
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
  progressivoRigoContabile: z.string().nullable().transform((val) => val ?? '0'),
  centroDiCosto: z.string().trim().optional(),
  parametro: currencyTransform,
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