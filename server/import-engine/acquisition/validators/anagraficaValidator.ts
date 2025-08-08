/**
 * ANAGRAFICA VALIDATOR
 * Schema Zod per validazione e coercizione dati A_CLIFOR.TXT
 * 
 * Tracciato: .docs/dati_cliente/tracciati/A_CLIFOR.TXT
 * Parser Python: parser_a_clifor copy.py
 */

import { z } from 'zod';

// Schema per i dati grezzi (tutte stringhe dal parser)
export const rawAnagraficaSchema = z.object({
  codiceFiscaleAzienda: z.string().default(''),
  subcodiceAzienda: z.string().default(''),
  codiceUnivoco: z.string().default(''),
  codiceFiscaleClifor: z.string().default(''),
  subcodiceClifor: z.string().default(''),
  tipoConto: z.string().default(''),
  sottocontoCliente: z.string().default(''),
  sottocontoFornitore: z.string().default(''),
  codiceAnagrafica: z.string().default(''),
  partitaIva: z.string().default(''),
  tipoSoggetto: z.string().default(''),
  denominazione: z.string().default(''),
  cognome: z.string().default(''),
  nome: z.string().default(''),
  sesso: z.string().default(''),
  dataNascita: z.string().default(''),
  comuneNascita: z.string().default(''),
  comuneResidenza: z.string().default(''),
  cap: z.string().default(''),
  indirizzo: z.string().default(''),
  prefissoTelefono: z.string().default(''),
  numeroTelefono: z.string().default(''),
  idFiscaleEstero: z.string().default(''),
  codiceIso: z.string().default(''),
  codiceIncassoPagamento: z.string().default(''),
  codiceIncassoCliente: z.string().default(''),
  codicePagamentoFornitore: z.string().default(''),
  codiceValuta: z.string().default(''),
  gestioneDati770: z.string().default(''),
  soggettoARitenuta: z.string().default(''),
  quadro770: z.string().default(''),
  contributoPrevidenziale: z.string().default(''),
  codiceRitenuta: z.string().default(''),
  enasarco: z.string().default(''),
  tipoRitenuta: z.string().default(''),
  soggettoInail: z.string().default(''),
  contributoPrevid335: z.string().default(''),
  aliquota: z.string().default(''),
  percContributoCassa: z.string().default(''),
  attivitaMensilizzazione: z.string().default('')
});

// Non più necessario uno schema separato per la validazione,
// Zod gestisce già la coercizione e la validazione in un unico passaggio.
// Manteniamo il tipo per chiarezza
export type ValidatedAnagrafica = z.infer<typeof rawAnagraficaSchema>;
export type RawAnagrafica = z.infer<typeof rawAnagraficaSchema>;

/**
 * Valida e pulisce i dati grezzi dall'anagrafica.
 * DEPRECATO: La validazione ora avviene direttamente nel workflow tramite `rawAnagraficaSchema.safeParse`.
 * Questa funzione può essere rimossa in futuro.
 */
export function validateAnagrafica(rawData: ValidatedAnagrafica): ValidatedAnagrafica {
  const validationResult = rawAnagraficaSchema.safeParse(rawData);
  if (!validationResult.success) {
    // In un'applicazione reale, gestire l'errore in modo più robusto
    throw new Error(`Validation failed: ${JSON.stringify(validationResult.error)}`);
  }
  return validationResult.data;
} 