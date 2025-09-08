import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser.js';
import {
  rawCodiceIvaSchema,
  type RawCodiceIva,
} from '../../acquisition/validators/codiceIvaValidator.js';

const prisma = new PrismaClient();

export interface CodiceIvaImportResult {
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
 * Orchestra l'intero processo di importazione per i codici IVA in staging.
 * @param fileContent Il contenuto del file da importare.
 * @returns Statistiche sull'esito dell'importazione.
 */
export async function runImportCodiciIvaWorkflow(fileContent: string): Promise<CodiceIvaImportResult> {
  console.log('🚀 Inizio workflow importazione codici IVA in staging');
  const errors: Array<{ row: number; error: string; data: unknown }> = [];

  try {
    // 1. Parsing
    const parseResult = await parseFixedWidth<RawCodiceIva>(fileContent, 'codici_iva');
    const { stats: parseStats, data: rawRecords } = parseResult;
    console.log(`[Workflow Codici IVA] Parsati ${rawRecords.length} record grezzi.`);

    // 2. Validazione
    const validRecords: RawCodiceIva[] = [];
    // MODIFICA: Sostituito il loop for...of con un for...i per compatibilità
    for (let index = 0; index < rawRecords.length; index++) {
      const rawRecord = rawRecords[index];
      const validationResult = rawCodiceIvaSchema.safeParse(rawRecord);
      if (validationResult.success) {
        validRecords.push(validationResult.data);
      } else {
        const errorRow = index + 1;
        const errorMessage = JSON.stringify(validationResult.error.flatten());
        console.warn(`[Workflow Codici IVA] Errore di validazione alla riga ${errorRow}:`, errorMessage);
        errors.push({
          row: errorRow,
          error: errorMessage,
          data: rawRecord
        });
      }
    }
    console.log(`[Workflow Codici IVA] Validazione completata. Record validi: ${validRecords.length}, Errori: ${errors.length}.`);

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
                const value = record[key as keyof RawCodiceIva];
                recordAsString[key] = value?.toString() ?? '';
            }
        }
        return recordAsString;
    });

    await prisma.stagingCodiceIva.deleteMany({});
    const result = await prisma.stagingCodiceIva.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });
    
    const finalMessage = `[Workflow Codici IVA] Salvataggio in staging completato. Record salvati: ${result.count}.`;
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
    const errorMessage = `[Workflow Codici IVA] Errore fatale durante l'importazione: ${error instanceof Error ? error.message : String(error)}`;
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