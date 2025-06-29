import { z } from 'zod';

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

/**
 * Converte data GGMMAAAA in Date object
 * Gestisce valori nulli, vuoti e date non valide (00000000)
 */
const dateTransform = z
  .string()
  .transform((val) => {
    if (!val || val.trim() === '' || val.trim() === '00000000') {
      return null;
    }
    
    const cleaned = val.trim().padStart(8, '0');
    if (cleaned.length !== 8) return null;
    
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);
    
    const date = new Date(`${year}-${month}-${day}`);
    return isNaN(date.getTime()) ? null : date;
  })
  .nullable();

/**
 * Converte numeri con decimali impliciti (divide per 100)
 * Gestisce valori vuoti, null e non numerici
 * Accetta sia stringhe che numeri dal parsing
 */
const currencyTransform = z
  .string()
  .nullable()
  .transform((val) => {
    if (!val || val.trim() === '') return 0;
    const cleaned = val.trim();
    if (cleaned.includes('.') || cleaned.includes(',')) {
      const parsed = parseFloat(cleaned.replace(',', '.'));
      return isNaN(parsed) ? 0 : parsed;
    } else {
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? 0 : parsed / 100;
    }
  });

/**
 * Converte flag '1'/'0' in boolean
 */
const flagTransform = z
  .string()
  .transform((val) => val?.trim() === '1');

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
  dataRegistrazione: z.date().nullable(),
  clienteFornitoreCodiceFiscale: z.string(),
  dataDocumento: z.date().nullable(),
  numeroDocumento: z.string(),
  totaleDocumento: z.string().nullable(),
  noteMovimento: z.string(),
});

export const validatedPnTestaSchema = z.object({
  externalId: z.string().trim().min(1, "External ID richiesto"),
  causaleId: z.string().trim(),
  dataRegistrazione: dateTransform,
  clienteFornitoreCodiceFiscale: z.string().trim().optional(),
  dataDocumento: dateTransform,
  numeroDocumento: z.string().trim().optional(),
  totaleDocumento: currencyTransform,
  noteMovimento: z.string().trim().optional(),
});

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
  insDatiMovimentiAnalitici: z.boolean(),
  dataInizioCompetenza: z.date().nullable(),
  dataFineCompetenza: z.date().nullable(),
  dataRegistrazioneApertura: z.date().nullable(),
  dataInizioCompetenzaAnalit: z.date().nullable(),
  dataFineCompetenzaAnalit: z.date().nullable(),
});

export const validatedPnRigConSchema = z.object({
  externalId: z.string().trim().min(1, "External ID richiesto"),
  progressivoRigo: z.coerce.number().int().min(0, "Progressivo deve essere >= 0").nullable().transform(val => val ?? 0),
  tipoConto: z.string().trim().optional(),
  clienteFornitoreCodiceFiscale: z.string().trim().optional(),
  conto: z.string().trim().optional(),
  importoDare: currencyTransform,
  importoAvere: currencyTransform,
  note: z.string().trim().optional(),
  insDatiMovimentiAnalitici: z.boolean().optional(),
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
});

export const validatedPnRigIvaSchema = z.object({
  externalId: z.string().trim().min(1, "External ID richiesto"),
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
  documentoOperazione: z.date().nullable(),
});

export const validatedMovAnacSchema = z.object({
  externalId: z.string().trim().min(1, "External ID richiesto"),
  progressivoRigoContabile: z.coerce.number().int().min(0, "Progressivo riga deve essere >= 0").nullable().transform(val => val ?? 0),
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