import { PrismaClient } from '@prisma/client';
import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { rawCondizionePagamentoSchema, RawCondizionePagamento } from '../../acquisition/validators/condizioniPagamentoValidator';

const prisma = new PrismaClient();

export interface CondizionePagamentoImportResult {
  success: boolean;
  message: string;
  stats: {
    totalRecords: number;
    successfulRecords: number;
    errorRecords: number;
  };
  errors: Array<{ row: number; error: string; data: unknown }>;
}

export async function runImportCondizioniPagamentoWorkflow(fileContent: string): Promise<CondizionePagamentoImportResult> {
  console.log('🚀 Inizio workflow importazione condizioni di pagamento in staging');
  const errors: Array<{ row: number; error: string; data: unknown }> = [];

  try {
    // 1. Parsing
    const parseResult = await parseFixedWidth<RawCondizionePagamento>(fileContent, 'condizioni_pagamento');
    const { data: rawRecords } = parseResult;
    console.log(`[Workflow Condizioni Pagamento] Parsati ${rawRecords.length} record grezzi.`);

    // 2. Validazione
    const validRecords: RawCondizionePagamento[] = [];
    for (const [index, record] of rawRecords.entries()) {
      const validationResult = rawCondizionePagamentoSchema.safeParse(record);
      if (validationResult.success) {
        validRecords.push(validationResult.data);
      } else {
        const errorRow = index + 1;
        const errorMessage = JSON.stringify(validationResult.error.flatten());
        console.warn(`[Workflow Condizioni Pagamento] Errore di validazione alla riga ${errorRow}:`, errorMessage);
        errors.push({
          row: errorRow,
          error: errorMessage,
          data: record
        });
      }
    }
    console.log(`[Workflow Condizioni Pagamento] Validazione completata. Record validi: ${validRecords.length}, Errori: ${errors.length}.`);

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
                const value = record[key as keyof RawCondizionePagamento];
                recordAsString[key] = value?.toString() ?? '';
            }
        }
        return recordAsString;
    });

    await prisma.stagingCondizionePagamento.deleteMany({});
    const result = await prisma.stagingCondizionePagamento.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });
    
    const finalMessage = `[Workflow Condizioni Pagamento] Salvataggio in staging completato. Record salvati: ${result.count}.`;
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
    const errorMessage = `[Workflow Condizioni Pagamento] Errore fatale: ${error instanceof Error ? error.message : String(error)}`;
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