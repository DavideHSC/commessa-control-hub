import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser.js';
import { causaleContabileValidator } from '../../acquisition/validators/causaleContabileValidator.js';
import { z } from 'zod';

const prisma = new PrismaClient();

// Definiamo un tipo per i dati grezzi, poiché il validatore esegue già coercizione
type RawCausaleContabile = Record<string, unknown>;

export interface CausaleContabileImportResult {
  success: boolean;
  message: string;
  stats: {
    totalRecords: number;
    successfulRecords: number;
    errorRecords: number;
  };
  errors: Array<{ row: number; error: string; data: unknown }>;
}

/**
 * Orchestra l'intero processo di importazione per le causali contabili in staging.
 * @param fileContent Il contenuto del file da importare.
 * @returns Statistiche sull'esito dell'importazione.
 */
export async function runImportCausaliContabiliWorkflow(fileContent: string): Promise<CausaleContabileImportResult> {
  console.log('🚀 Inizio workflow importazione causali contabili in staging');
  const errors: Array<{ row: number; error: string; data: unknown }> = [];

  try {
    // 1. Parsing
    const parseResult = await parseFixedWidth<RawCausaleContabile>(fileContent, 'causali');
    const { data: rawRecords } = parseResult;
    console.log(`[Workflow Causali] Parsati ${rawRecords.length} record grezzi.`);

    // 2. Validazione
    const validRecords: z.infer<typeof causaleContabileValidator>[] = [];
    // MODIFICA: Sostituito il loop for...of con un for...i per compatibilità
    for (let index = 0; index < rawRecords.length; index++) {
      const record = rawRecords[index];
      const validationResult = causaleContabileValidator.safeParse(record);
      if (validationResult.success) {
        validRecords.push(validationResult.data);
      } else {
        const errorRow = index + 1;
        const errorMessage = JSON.stringify(validationResult.error.flatten());
        console.warn(`[Workflow Causali] Errore di validazione alla riga ${errorRow}:`, errorMessage);
        errors.push({
          row: errorRow,
          error: errorMessage,
          data: record
        });
      }
    }
    console.log(`[Workflow Causali] Validazione completata. Record validi: ${validRecords.length}, Errori: ${errors.length}.`);

    if (validRecords.length === 0) {
        return {
            success: true,
            message: 'Nessun record valido da importare.',
            stats: {
                totalRecords: rawRecords.length,
                successfulRecords: 0,
                errorRecords: errors.length,
            },
            errors,
        };
    }

    // 3. Salvataggio in Staging
    const recordsToCreate = validRecords.map(record => {
        const recordAsString: { [key: string]: string } = {};
        for (const key in record) {
            if (Object.prototype.hasOwnProperty.call(record, key)) {
                const value = record[key as keyof typeof record];
                recordAsString[key] = value?.toString() ?? '';
            }
        }
        return recordAsString;
    });
    
    await prisma.stagingCausaleContabile.deleteMany({});
    const result = await prisma.stagingCausaleContabile.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });
    
    const finalMessage = `[Workflow Causali] Salvataggio in staging completato. Record salvati: ${result.count}.`;
    console.log(finalMessage);

    return {
        success: true,
        message: finalMessage,
        stats: {
            totalRecords: rawRecords.length,
            successfulRecords: result.count,
            errorRecords: errors.length + (validRecords.length - result.count)
        },
        errors
    };

  } catch (error) {
    const errorMessage = `[Workflow Causali] Errore fatale: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage, error);
    return {
        success: false,
        message: errorMessage,
        stats: {
            totalRecords: 0,
            successfulRecords: 0,
            errorRecords: 0
        },
        errors: [{ row: 0, error: errorMessage, data: {} }]
    };
  }
}