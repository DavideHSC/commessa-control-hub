import { z } from 'zod';

/**
 * @deprecated Utilizzare `validatedCondizionePagamentoSchema` per la validazione record per record.
 */
export const rawCondizionePagamentoSchema = z.object({
  /**
   * Codice univoco della condizione di pagamento. Campo obbligatorio.
   * Corrisponde a `id` e `codice` nel modello Prisma.
   */
  codicePagamento: z.string().trim().min(1, {
    message: 'Il campo codicePagamento è obbligatorio.',
  }),

  /**
   * Descrizione della condizione di pagamento.
   */
  descrizione: z.string().trim().optional(),

  /**
   * Numero di rate previste. Viene convertito da stringa a numero intero.
   */
  numeroRate: z.coerce.number().int().optional().nullable(),

  /**
   * Conto di incasso o pagamento associato.
   */
  contoIncassoPagamento: z.string().trim().optional(),

  /**
   * Codice per la suddivisione dei pagamenti (es. 'F' per fine mese).
   */
  suddivisione: z.string().trim().optional(),

  /**
   * Codice per l'inizio della scadenza.
   */
  inizioScadenza: z.string().trim().optional(),

  /**
   * Flag che indica se i giorni di scadenza sono da calcolarsi commercialmente.
   * Il valore 'X' viene trasformato in `true`, altrimenti `false`.
   */
  calcolaGiorniCommerciali: z.preprocess((val) => val === 'X', z.boolean()),

  /**
   * Flag che indica se nel calcolo delle scadenze si devono considerare
   * i periodi di chiusura aziendale.
   * Il valore 'X' viene trasformato in `true`, altrimenti `false`.
   */
  consideraPeriodiChiusura: z.preprocess((val) => val === 'X', z.boolean()),
});

/**
 * Schema Zod per la validazione e coercizione di una singola Condizione di Pagamento grezza.
 */
export const validatedCondizionePagamentoSchema = z.object({
  codice: z.string().optional(),
  descrizione: z.string().optional(),
  giorni: z.number().int().optional(),
  percentualeSconto: z.number().optional(),
  tipoScadenza: z.string().optional(),
  primaNota: z.boolean().optional(),
});

/**
 * @deprecated Utilizzare `ValidatedCondizionePagamento`.
 */
export type RawCondizionePagamento = z.infer<typeof rawCondizionePagamentoSchema>;

/**
 * Tipo TypeScript che rappresenta una condizione di pagamento dopo la validazione.
 */
export type ValidatedCondizionePagamento = z.infer<typeof validatedCondizionePagamentoSchema>; 