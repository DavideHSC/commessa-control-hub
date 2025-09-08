/**
 * CENTRO COSTO VALIDATOR
 * Schema Zod per validazione e coercizione dati ANAGRACC.TXT
 * 
 * Tracciato: .docs/dati_cliente/tracciati/modificati/ANAGRACC.md
 * Funzione: Validazione centri di costo per allocazioni analitiche
 */

import { z } from 'zod';

// Schema per i dati grezzi (tutte stringhe dal parser fixed-width)
export const rawCentroCostoSchema = z.object({
  codiceFiscaleAzienda: z.string().default(''),
  subcodeAzienda: z.string().default(''),
  codice: z.string()
    .min(1, 'Codice centro di costo richiesto')
    .max(4, 'Codice centro di costo massimo 4 caratteri'),
  descrizione: z.string()
    .min(1, 'Descrizione centro di costo richiesta')
    .max(40, 'Descrizione massimo 40 caratteri'),
  responsabile: z.string().optional().default(''),
  livello: z.string()
    .regex(/^\d{0,2}$/, 'Livello deve essere numerico (0-99)')
    .default('0'),
  note: z.string().optional().default('')
});

// Schema per validazione business rules aggiuntive
export const validatedCentroCostoSchema = rawCentroCostoSchema.extend({
  // Validazioni aggiuntive per business logic
  codice: z.string()
    .min(1, 'Codice centro di costo richiesto')
    .max(4, 'Codice centro di costo massimo 4 caratteri')
    .regex(/^[A-Z0-9]+$/, 'Codice deve contenere solo lettere maiuscole e numeri'),
  
  livello: z.string()
    .regex(/^\d{0,2}$/, 'Livello deve essere numerico')
    .refine((val) => {
      const num = parseInt(val || '0');
      return num >= 0 && num <= 99;
    }, 'Livello deve essere compreso tra 0 e 99'),
    
  // Validazione gerarchia aziendale basata sul livello
  livelloDescription: z.string().optional().transform((_, ctx) => {
    const livello = parseInt(ctx.path[0] === 'livello' ? (ctx.root as any).livello || '0' : '0');
    if (livello === 1) return 'Direzione Generale';
    if (livello === 2) return 'Divisione';
    if (livello === 3) return 'Reparto';
    if (livello >= 4) return 'Centro Operativo';
    return 'Non classificato';
  })
});

// Tipi TypeScript derivati dagli schema
export type RawCentroCosto = z.infer<typeof rawCentroCostoSchema>;
export type ValidatedCentroCosto = z.infer<typeof validatedCentroCostoSchema>;

/**
 * Valida i dati grezzi del centro di costo.
 * Applica sia la validazione di formato che le business rules.
 */
export function validateCentroCosto(rawData: RawCentroCosto): ValidatedCentroCosto {
  const validationResult = validatedCentroCostoSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    throw new Error(`Centro di costo validation failed: ${JSON.stringify(validationResult.error.errors)}`);
  }
  
  return validationResult.data;
}

/**
 * Valida array di centri di costo con validazione a batch.
 * Utile per import di massa con report errori dettagliato.
 */
export function validateCentriCostoBatch(rawDataArray: RawCentroCosto[]): {
  valid: ValidatedCentroCosto[];
  errors: { index: number; data: RawCentroCosto; errors: any[] }[];
} {
  const valid: ValidatedCentroCosto[] = [];
  const errors: { index: number; data: RawCentroCosto; errors: any[] }[] = [];
  
  rawDataArray.forEach((rawData, index) => {
    const validationResult = validatedCentroCostoSchema.safeParse(rawData);
    
    if (validationResult.success) {
      valid.push(validationResult.data);
    } else {
      errors.push({
        index,
        data: rawData,
        errors: validationResult.error.errors
      });
    }
  });
  
  return { valid, errors };
}

/**
 * Utility per validare unicità codici centri di costo.
 * Previene duplicati durante l'import.
 */
export function validateCodiciUnivoci(centriCosto: ValidatedCentroCosto[]): {
  isValid: boolean;
  duplicati: string[];
} {
  const codiciVisti = new Set<string>();
  const duplicati: string[] = [];
  
  centriCosto.forEach((centro) => {
    const chiaveUnica = `${centro.codiceFiscaleAzienda}-${centro.subcodeAzienda}-${centro.codice}`;
    
    if (codiciVisti.has(chiaveUnica)) {
      duplicati.push(centro.codice);
    } else {
      codiciVisti.add(chiaveUnica);
    }
  });
  
  return {
    isValid: duplicati.length === 0,
    duplicati
  };
}