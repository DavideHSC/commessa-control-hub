import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import fs from 'fs/promises';
import iconv from 'iconv-lite';

const prisma = new PrismaClient();

/**
 * Definizione di un campo per il parser a larghezza fissa.
 */
export interface FieldDefinition {
  fieldName: string | null;
  start: number;
  length: number;
  type?: 'string' | 'number' | 'date' | 'boolean';
  format?: 'percentage' | 'date:DDMMYYYY' | 'boolean';
}

/**
 * Configurazione di validazione per record
 */
interface RecordValidation {
  expectedLength: number;
  tolerance?: number;
  required: boolean;
}

/**
 * Statistiche di elaborazione import
 */
export interface ImportStats {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  inserted: number;
  updated: number;
  skipped: number;
  warnings: string[];
  errors: string[];
}

/**
 * Risultato completo del parsing
 */
export interface ParseResult<T> {
  data: T[];
  stats: ImportStats;
}

// Configurazioni di validazione per i template (Fase 2.2)
const RECORD_VALIDATIONS: Record<string, RecordValidation> = {
  'causali': { expectedLength: 171, required: true },
  'codici_iva': { expectedLength: 162, required: true },
  'anagrafica_clifor': { expectedLength: 338, required: true },
  'piano_dei_conti': { expectedLength: 388, required: true },
  'condizioni_pagamento': { expectedLength: 68, required: true }
};

function getDefaultValue(type?: 'string' | 'number' | 'date' | 'boolean') {
    switch (type) {
        case 'number':
            return 0;
        case 'date':
            return null;
        case 'boolean':
            return false;
        case 'string':
        default:
            return '';
    }
}

// === FASE 2.1: FALLBACK ENCODING ROBUSTO ===
/**
 * Legge file con fallback su diversi encoding (basato su parser Python)
 */
async function readFileWithFallbackEncoding(filePath: string): Promise<string[]> {
  // Sequenza di encoding comuni usata nei parser Python per massima compatibilità
  // NOTA: cp1252 e iso-8859-1 non sono supportati nativamente come BufferEncoding in Node.js,
  // 'latin1' è il fallback più vicino e gestisce la maggior parte dei caratteri.
  const encodings: BufferEncoding[] = ['utf-8', 'latin1', 'ascii'];
  
  for (const encoding of encodings) {
    try {
      const content = await fs.readFile(filePath, { encoding });
      console.log(`[Parser] File aperto con encoding: ${encoding}`);
      return content.split(/\r?\n/);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`File non trovato: ${filePath}`);
      }
      console.warn(`[Parser] Encoding ${encoding} fallito, provo il prossimo...`);
      continue;
    }
  }
  
  throw new Error('Nessun encoding supportato ha funzionato');
}

// === FASE 2.2: VALIDAZIONE LUNGHEZZA RECORD ===
/**
 * Valida la lunghezza di un record (basato su pattern Python)
 */
function validateRecordLength(line: string, templateName: string, lineNumber: number): boolean {
  const validation = RECORD_VALIDATIONS[templateName];
  if (!validation) return true; // Nessuna validazione configurata
  
  const cleanLine = line.replace(/\r?\n$/, '');
  const actualLength = cleanLine.length;
  
  if (actualLength < validation.expectedLength) {
    console.warn(`[Parser] Riga ${lineNumber}: lunghezza insufficiente (${actualLength} < ${validation.expectedLength})`);
    return !validation.required;
  }
  
  return true;
}

// === FASE 2.3: GESTIONE ERRORI GRACEFUL ===
/**
 * Elabora records con gestione errori robusta (pattern Python)
 */
async function processWithErrorHandling<T>(
  records: string[],
  processor: (line: string, index: number) => T,
  templateName: string
): Promise<ParseResult<T>> {
  const stats: ImportStats = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    warnings: [],
    errors: []
  };
  
  const data: T[] = [];
  
  console.log(`[Parser] Inizio elaborazione ${records.length} righe per template '${templateName}'`);
  
  for (let i = 0; i < records.length; i++) {
    const line = records[i];
    
    // Salta righe vuote
    if (line.trim().length === 0) {
      continue;
    }
    
    stats.totalRecords++;
    
    try {
      // Validazione lunghezza record
      if (!validateRecordLength(line, templateName, i + 1)) {
        const warning = `Riga ${i + 1}: lunghezza record non valida`;
        stats.warnings.push(warning);
        continue;
      }
      
      // Elaborazione record
      const result = processor(line, i);
      data.push(result);
      stats.successfulRecords++;
      
      // Log ogni 100 record (come in Python)
      if (stats.successfulRecords % 100 === 0) {
        console.log(`[Parser] Elaborati ${stats.successfulRecords} record...`);
      }
      
    } catch (error: unknown) {
      stats.errorRecords++;
      const errorMsg = `Errore riga ${i + 1}: ${(error as Error).message}`;
      stats.errors.push(errorMsg);
      console.error(`[Parser] ${errorMsg}`);
      
      // Continua processing invece di fermarsi (graceful)
      continue;
    }
  }
  
  // Statistiche finali
  console.log(`[Parser] Parsing completato:`);
  console.log(`  - Record totali letti: ${stats.totalRecords}`);
  console.log(`  - Record elaborati con successo: ${stats.successfulRecords}`);
  console.log(`  - Record con errori: ${stats.errorRecords}`);
  if (stats.warnings.length > 0) {
    console.log(`  - Avvisi: ${stats.warnings.length}`);
  }
  
  return { data, stats };
}

/**
 * Parser boolean flag (come in Python)
 */
function parseBooleanFlag(char: string): boolean {
  return char.trim().toUpperCase() === 'X';
}

/**
 * Parser decimal con gestione errori (migliorato)
 */
function parseDecimal(value: string, decimals: number = 2): number | null {
  if (!value || value.trim() === '') return null;
  
  try {
    const cleanValue = value.trim().replace(',', '.');
    const numericValue = parseFloat(cleanValue);
    
    if (isNaN(numericValue)) return null;
    
    return decimals > 0 ? Math.round(numericValue * Math.pow(10, decimals)) / Math.pow(10, decimals) : numericValue;
  } catch {
    return null;
  }
}

/**
 * Parser percentage (basato su logica parser Python)
 * Converte stringhe come "002200" in 22 (percentuale)
 */
function parsePercentage(value: string): number | null {
  if (!value || value.trim() === '') return null;
  
  try {
    const cleanValue = value.trim();
    const numericValue = parseInt(cleanValue, 10);
    
    if (isNaN(numericValue)) return null;
    
    // Dividi per 100 per convertire da formato "002200" a 22
    return numericValue / 100;
  } catch {
    return null;
  }
}

/**
 * Esegue il parsing di una stringa di testo a larghezza fissa.
 * VERSIONE LEGACY - mantenuta per compatibilità
 */
export function parseFixedWidth<T>(
  content: string,
  definitions: FieldDefinition[]
): T[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const results: T[] = [];

  lines.forEach((line, index) => {
    const record: Record<string, unknown> = {};
    let hasData = false;

    for (const def of definitions) {
      const { fieldName, start, length, type, format } = def;
      const name = fieldName ?? 'unknown'; // Fallback per il nome del campo
      const startIndex = start - 1;
      
      if (startIndex < 0 || startIndex >= line.length) {
        record[name] = getDefaultValue(type);
        continue;
      }

      const rawValue = line.substring(startIndex, startIndex + length).trim();

      if (rawValue) {
        hasData = true;
      }

      try {
        // Gestione formato percentage
        if (format === 'percentage') {
          record[name] = parsePercentage(rawValue);
        } else if (format === 'boolean') {
          record[name] = parseBooleanFlag(rawValue);
        } else {
          switch (type) {
            case 'boolean':
              record[name] = parseBooleanFlag(rawValue);
              break;
            case 'number':
              record[name] = parseDecimal(rawValue);
              break;
            case 'date':
              if (rawValue && rawValue !== '00000000') {
                const parsedDate = moment(rawValue, 'DDMMYYYY', true);
                record[name] = parsedDate.isValid() ? parsedDate.toDate() : null;
              } else {
                record[name] = null;
              }
              break;
            case 'string':
            default:
              record[name] = rawValue;
              break;
          }
        }
      } catch (e) {
        console.error(`[Parser] Errore nella conversione del campo '${name}' con valore "${rawValue}" per la riga ${index + 1}.`, e);
        record[name] = getDefaultValue(type);
      }
    }

    if (hasData) {
      results.push(record as T);
    }
  });

  console.log(`[Parser] Parsing completato. ${results.length} record estratti dal file.`);
  return results;
}

/**
 * Converte camelCase a UPPER_CASE con underscore per compatibilità validator
 */
function camelToUpperCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, ''); // Rimuove underscore iniziale se presente
}

/**
 * NUOVA VERSIONE ROBUSTA - Parsing con encoding fallback e gestione errori
 */
export async function parseFixedWidthRobust<T>(
  filePath: string,
  definitions: FieldDefinition[],
  templateName: string
): Promise<ParseResult<T>> {
  const stats: ImportStats = {
    totalRecords: 0,
    successfulRecords: 0,
    errorRecords: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    warnings: [],
    errors: [],
  };

  try {
    let actualDefinitions = definitions;
    
    // Se non ci sono definitions, caricale dal database usando templateName
    if (definitions.length === 0 && templateName) {
      console.log(`[Parser] Caricamento template '${templateName}' dal database...`);
      
      const template = await prisma.importTemplate.findUnique({
        where: { name: templateName },
        include: { fieldDefinitions: true }
      });
      
      if (!template) {
        throw new Error(`Template '${templateName}' non trovato nel database`);
      }
      
      if (template.fieldDefinitions.length === 0) {
        throw new Error(`Template '${templateName}' non ha field definitions`);
      }
      
      // Converti FieldDefinition da Prisma al formato FieldDefinition locale
      actualDefinitions = template.fieldDefinitions.map(field => ({
        fieldName: field.fieldName ? camelToUpperCase(field.fieldName) : null,
        start: field.start,
        length: field.length,
        type: 'string' as const, // Default type
        format: field.format ? 
          (field.format as 'boolean' | 'percentage' | 'date:DDMMYYYY') : 
          undefined
      }));
      
      console.log(`[Parser] Caricato template con ${actualDefinitions.length} field definitions`);
    }

    // Leggi file con encoding fallback
    const lines = await readFileWithFallbackEncoding(filePath);
    
    // Processor function per ogni linea
    const processor = (line: string, index: number): T => {
      const record: Record<string, unknown> = {};
      let hasData = false;

      for (const def of actualDefinitions) {
        const { fieldName, start, length, type, format } = def;
        const name = fieldName ?? 'unknown'; // Fallback per il nome del campo
        const startIndex = start - 1;
        
        if (startIndex < 0 || startIndex >= line.length) {
          record[name] = getDefaultValue(type);
          continue;
        }

        const rawValue = line.substring(startIndex, startIndex + length).trim();

        if (rawValue) {
          hasData = true;
        }

        // Gestione formato percentage
        if (format === 'percentage') {
          record[name] = parsePercentage(rawValue);
        } else if (format === 'boolean') {
          record[name] = parseBooleanFlag(rawValue);
        } else {
          switch (type) {
            case 'boolean':
              record[name] = parseBooleanFlag(rawValue);
              break;
            case 'number':
              record[name] = parseDecimal(rawValue);
              break;
            case 'date':
              if (rawValue && rawValue !== '00000000') {
                const parsedDate = moment(rawValue, 'DDMMYYYY', true);
                record[name] = parsedDate.isValid() ? parsedDate.toDate() : null;
              } else {
                record[name] = null;
              }
              break;
            case 'string':
            default:
              record[name] = rawValue;
              break;
          }
        }
      }

      if (!hasData) {
        throw new Error('Record vuoto o senza dati validi');
      }

      return record as T;
    };
    
    // Elabora con gestione errori
    return await processWithErrorHandling(lines, processor, templateName);
    
  } catch (error: unknown) {
    // Errore fatale
    const stats: ImportStats = {
      totalRecords: 0,
      successfulRecords: 0,
      errorRecords: 1,
      inserted: 0,
      updated: 0,
      skipped: 0,
      warnings: [],
      errors: [(error as Error).message]
    };
    
    return { data: [], stats };
  }
} 