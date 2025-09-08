import { z } from 'zod';

/**
 * Funzione di utilità per trasformare una stringa in un booleano.
 * La logica si basa sul fatto che 'X' indica vero, qualsiasi altro valore falso.
 * @param val La stringa da trasformare.
 * @returns Un booleano.
 */
const toBoolean = (val: unknown) => String(val).trim().toUpperCase() === 'X';

/**
 * Schema di validazione Zod per i dati grezzi delle causali contabili.
 * Esegue la validazione e la coercizione dei tipi per i flag booleani,
 * ma mantiene le date come stringhe grezze, come richiesto dal pattern "Staging Pulito".
 */
export const causaleContabileValidator = z.object({
  codiceCausale: z.string().trim(),
  descrizione: z.string().trim(),
  tipoMovimento: z.string().default(''),
  tipoAggiornamento: z.string().default(''),
  // highlight-start
  // MODIFICA: I campi data vengono ora mantenuti come stringhe grezze.
  // La validazione del formato (es. 8 cifre) e la conversione a DateTime
  // avverranno durante la fase di finalizzazione.
  dataInizio: z.string().default(''),
  dataFine: z.string().default(''),
  // highlight-end
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