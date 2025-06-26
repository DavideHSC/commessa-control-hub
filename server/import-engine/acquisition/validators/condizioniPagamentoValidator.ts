import { z } from 'zod';

/**
 * Schema Zod per la validazione e coercizione dei dati grezzi
 * provenienti dal file a larghezza fissa per le Condizioni di Pagamento.
 *
 * Questo schema si occupa di:
 * 1. Definire i tipi di dati attesi per ogni campo.
 * 2. Eseguire la coercizione dei tipi (es. da stringa a numero).
 * 3. Trasformare valori specifici (es. 'X' in `true`).
 * 4. Gestire campi opzionali o nullabili.
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
  calcolaGiorniCommerciali: z.boolean().optional(),

  /**
   * Flag che indica se nel calcolo delle scadenze si devono considerare
   * i periodi di chiusura aziendale.
   * Il valore 'X' viene trasformato in `true`, altrimenti `false`.
   */
  consideraPeriodiChiusura: z.boolean().optional(),
});

/**
 * Tipo TypeScript inferito dallo schema Zod.
 * Rappresenta l'oggetto dati dopo la validazione e la coercizione,
 * pronto per essere passato al livello di trasformazione.
 */
export type RawCondizionePagamento = z.infer<typeof rawCondizionePagamentoSchema>; 