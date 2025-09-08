import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Definizione di un campo per il parser a larghezza fissa.
 */
export interface FieldDefinition {
  fieldName: string | null;
  start: number;
  length: number;
  end?: number;
  format?: string | null;
}

/**
 * Statistiche di elaborazione import
 */
export interface ImportStats {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  warnings: { row: number; message: string; data: unknown }[];
  errors: { row: number; message: string; data: unknown }[];
}

/**
 * Risultato completo del parsing
 */
export interface ParseResult<T> {
  data: T[];
  stats: ImportStats;
}

/**
 * Elabora records con gestione errori robusta.
 */
async function processWithErrorHandling<T>(
  records: string[],
  processor: (line: string, index: number) => T
): Promise<ParseResult<T>> {
  const stats: ImportStats = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    warnings: [],
    errors: []
  };
  
  const data: T[] = [];
  
  for (let i = 0; i < records.length; i++) {
    const line = records[i];
    
    if (line.trim().length === 0) {
      continue;
    }
    
    stats.totalRecords++;
    
    try {
      const result = processor(line, i);
      data.push(result);
      stats.successfulRecords++;
    } catch (error: unknown) {
      stats.errorRecords++;
      const errorMessage = (error as Error).message || 'Errore di parsing sconosciuto';
      stats.errors.push({
        row: i + 1,
        message: errorMessage,
        data: line
      });
      console.warn(`Riga ${i + 1}: Errore - ${errorMessage}`);
    }
  }
  
  console.log(`[Parser] Parsing completato:`);
  console.log(`  - Record totali letti: ${stats.totalRecords}`);
  console.log(`  - Record elaborati con successo: ${stats.successfulRecords}`);
  console.log(`  - Record con errori: ${stats.errorRecords}`);
  
  return { data, stats };
}

/**
 * UNICO PARSER UFFICIALE
 * Esegue il parsing di una stringa di testo a larghezza fissa basandosi su un template definito nel database.
 * @param content Contenuto del file.
 * @param templateName Nome del template nel DB.
 * @param fileIdentifier Identificatore opzionale per filtrare le definizioni (es. 'PNTESTA.TXT').
 */
export async function parseFixedWidth<T>(
  content: string,
  templateName: string,
  fileIdentifier?: string,
): Promise<ParseResult<T>> {
  
  try {
    const template = await prisma.importTemplate.findUnique({
      where: { name: templateName },
      include: {
        fieldDefinitions: {
          where: { fileIdentifier: fileIdentifier || undefined },
          orderBy: { start: 'asc' },
        },
      },
    });
    
    if (!template) {
      throw new Error(`Template '${templateName}' non trovato nel database`);
    }
    
    if (template.fieldDefinitions.length === 0) {
      const errorMessage = fileIdentifier
        ? `Template '${templateName}' non ha definizioni per l'identificatore '${fileIdentifier}'`
        : `Template '${templateName}' non ha definizioni di campo`;
      throw new Error(errorMessage);
    }
    
    const lines = content.split(/\r?\n/);
    
    const processor = (line: string): T => {
      const record: Record<string, unknown> = {};
      
      for (const def of template.fieldDefinitions) {
        const { fieldName, start, length } = def;
        const name = fieldName ?? 'unknown';
        const startIndex = start - 1;
        
        const rawValue = line.substring(startIndex, startIndex + length).trim();
        record[name] = rawValue;
      }

      return record as T;
    };
    
    return await processWithErrorHandling(lines, processor);
    
  } catch (error: unknown) {
    console.error(`[Parser] Errore fatale durante il parsing con template '${templateName}':`, error);
    const stats: ImportStats = {
      totalRecords: content.split(/\r?\n/).length,
      successfulRecords: 0,
      errorRecords: content.split(/\r?\n/).length,
      warnings: [],
      errors: [{ row: 0, message: (error as Error).message, data: null }]
    };
    return { data: [], stats };
  }
}