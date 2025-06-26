import { z } from 'zod';

/**
 * Funzione di utilità per trasformare una stringa in un booleano.
 * La logica si basa sul fatto che 'X' indica vero, qualsiasi altro valore falso.
 * @param val La stringa da trasformare.
 * @returns Un booleano.
 */
const toBoolean = (val: unknown) => String(val).trim().toUpperCase() === 'X';

/**
 * Funzione di utilità per trasformare una stringa DDMMAAAA in un oggetto Date.
 * @param val La stringa da trasformare.
 * @returns Un oggetto Date o null se la data non è valida.
 */
const toDate = (val: unknown) => {
  const str = String(val).trim();
  if (!str || str === '00000000' || str.length !== 8) {
    return null;
  }
  const day = parseInt(str.substring(0, 2), 10);
  const month = parseInt(str.substring(2, 4), 10) - 1; // Mesi sono 0-indexed
  const year = parseInt(str.substring(4, 8), 10);

  // Verifica validità data (es. 31/02/2023 non è valido)
  const date = new Date(year, month, day);
  if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
    return date;
  }
  return null;
};


/**
 * Schema di validazione Zod per i dati grezzi delle causali contabili.
 * Esegue la validazione e la coercizione dei tipi.
 */
export const causaleContabileValidator = z.object({
  codiceCausale: z.string().trim(),
  descrizione: z.string().trim(),
  tipoMovimento: z.string().default(''),
  tipoAggiornamento: z.string().default(''),
  dataInizio: z.preprocess(toDate, z.date().nullable()),
  dataFine: z.preprocess(toDate, z.date().nullable()),
  tipoRegistroIva: z.string().default(''),
  segnoMovimentoIva: z.string().default(''),
  contoIva: z.string().default(''),
  generazioneAutofattura: z.preprocess(toBoolean, z.boolean()),
  tipoAutofatturaGenerata: z.string().default(''),
  contoIvaVendite: z.string().default(''),
  fatturaImporto0: z.preprocess(toBoolean, z.boolean()),
  fatturaValutaEstera: z.preprocess(toBoolean, z.boolean()),
  nonConsiderareLiquidazioneIva: z.preprocess(toBoolean, z.boolean()),
  ivaEsigibilitaDifferita: z.string().default(''),
  fatturaEmessaRegCorrispettivi: z.preprocess(toBoolean, z.boolean()),
  gestionePartite: z.string().default(''),
  gestioneIntrastat: z.preprocess(toBoolean, z.boolean()),
  gestioneRitenuteEnasarco: z.string().default(''),
  versamentoRitenute: z.preprocess(toBoolean, z.boolean()),
  noteMovimento: z.string().default(''),
  descrizioneDocumento: z.string().default(''),
  identificativoEsteroClifor: z.preprocess(toBoolean, z.boolean()),
  scritturaRettificaAssestamento: z.preprocess(toBoolean, z.boolean()),
  nonStampareRegCronologico: z.preprocess(toBoolean, z.boolean()),
  movimentoRegIvaNonRilevante: z.preprocess(toBoolean, z.boolean()),
  tipoMovimentoSemplificata: z.string().default(''),
});

/**
 * Tipo inferito dallo schema Zod per una causale contabile validata.
 */
export type ValidatedCausaleContabile = z.infer<typeof causaleContabileValidator>; 