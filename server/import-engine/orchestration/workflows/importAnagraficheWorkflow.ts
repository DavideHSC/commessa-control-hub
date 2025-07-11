/**
 * IMPORT ANAGRAFICHE WORKFLOW
 * Workflow orchestrato per importazione anagrafiche A_CLIFOR.TXT
 * 
 * Architettura: Acquisition → Validation → Transformation → Persistence
 * Pattern: Parser Type-Safe → Zod Validation → Pure Transform → Atomic DB
 */

import { parseFixedWidth } from '../../acquisition/parsers/typeSafeFixedWidthParser';
import { rawAnagraficaSchema, RawAnagrafica } from '../../acquisition/validators/anagraficaValidator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnagraficheImportResult {
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
 * Workflow principale per importazione anagrafiche in staging.
 */
export async function executeAnagraficheImportWorkflow(
  fileContent: string,
  templateName: string = 'anagrafica_clifor'
): Promise<AnagraficheImportResult> {
  
  console.log('🚀 Inizio workflow importazione anagrafiche in staging');
  
  const errors: Array<{ row: number; error: string; data: unknown }> = [];
  
  try {
    // **FASE 1: ACQUISITION - Parsing Type-Safe**
    console.log('📖 FASE 1: Parsing file A_CLIFOR.TXT...');
    
    const parseResult = await parseFixedWidth<RawAnagrafica>(fileContent, templateName);
    const { stats, data: parsedRecords } = parseResult;
    
    console.log(`✅ Parsing completato: ${stats.successfulRecords} righe processate su ${stats.totalRecords}.`);
    
    if (parsedRecords.length === 0) {
      return {
        success: true, // Non è un fallimento, semplicemente non c'erano dati
        message: 'Nessun dato valido trovato nel file di anagrafica.',
        stats: {
            totalRecords: stats.totalRecords,
            successfulRecords: 0,
            errorRecords: stats.errorRecords,
        },
        errors: [],
      };
    }
    
    // **FASE 2: VALIDATION**
    const validRecords: RawAnagrafica[] = [];
    for (const record of parsedRecords) {
        const validationResult = rawAnagraficaSchema.safeParse(record);
        if (validationResult.success) {
            validRecords.push(validationResult.data);
        } else {
            const errorRow = parsedRecords.indexOf(record) + 1;
            console.warn(`⚠️  Riga ${errorRow}: Record non valido - ${validationResult.error.message}`);
            errors.push({
                row: errorRow,
                error: `Record non valido: ${validationResult.error.message}`,
                data: record
            });
        }
    }
    
    console.log(`✅ Validazione completata: ${validRecords.length} record validi, ${errors.length} errori.`);
    
    if (validRecords.length === 0) {
      return {
        success: false,
        message: 'Nessun record ha superato la validazione.',
        stats: {
          totalRecords: stats.totalRecords,
          successfulRecords: 0,
          errorRecords: stats.totalRecords,
        },
        errors,
      };
    }
    
    // **FASE 3: PERSISTENCE - Salvataggio in Staging**
    // Converte tutti i campi in stringa per evitare errori di tipo nel DB
    const recordsToCreate = validRecords.map(record => {
        const recordAsString: { [key: string]: string } = {};
        for (const key in record) {
            if (Object.prototype.hasOwnProperty.call(record, key)) {
                const value = record[key as keyof RawAnagrafica];
                recordAsString[key] = value?.toString() ?? '';
            }
        }
        return recordAsString;
    });

    await prisma.stagingAnagrafica.deleteMany({});
    const result = await prisma.stagingAnagrafica.createMany({
      data: recordsToCreate,
      skipDuplicates: true,
    });
    
    // **RISULTATO FINALE**
    const finalMessage = `✅ Import anagrafiche in staging completato: ${result.count} record salvati.`;
    console.log(finalMessage);
    
    return {
      success: true,
      message: finalMessage,
      stats: {
          totalRecords: stats.totalRecords,
          successfulRecords: result.count,
          errorRecords: errors.length + (validRecords.length - result.count),
      },
      errors,
    };
    
  } catch (error) {
    const errorMessage = `❌ Errore critico durante l'importazione anagrafiche: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage, error);
    
    return {
      success: false,
      message: errorMessage,
      stats: {
        totalRecords: 0,
        successfulRecords: 0,
        errorRecords: 0,
      },
      errors,
    };
  }
} 