import moment from 'moment';
import fs from 'fs/promises';

/**
 * Definizione di un campo per il parser a larghezza fissa.
 */
export interface FieldDefinition {
  name: string;
  start: number;
  length: number;
  type?: 'string' | 'number' | 'date' | 'boolean';
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
  const encodings: BufferEncoding[] = ['utf-8', 'latin1', 'ascii'];
  
  for (const encoding of encodings) {
    try {
      const content = await fs.readFile(filePath, { encoding });
      console.log(`[Parser] File aperto con encoding: ${encoding}`);
      return content.split(/\r?\n/);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
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
      
    } catch (error: any) {
      stats.errorRecords++;
      const errorMsg = `Errore riga ${i + 1}: ${error.message}`;
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
    const record: { [key: string]: any } = {};
    let hasData = false;

    for (const def of definitions) {
      const { name, start, length, type } = def;
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
 * NUOVA VERSIONE ROBUSTA - Parsing con encoding fallback e gestione errori
 */
export async function parseFixedWidthRobust<T>(
  filePath: string,
  definitions: FieldDefinition[],
  templateName: string
): Promise<ParseResult<T>> {
  try {
    // Leggi file con encoding fallback
    const lines = await readFileWithFallbackEncoding(filePath);
    
    // Processor function per ogni linea
    const processor = (line: string, index: number): T => {
      const record: { [key: string]: any } = {};
      let hasData = false;

      for (const def of definitions) {
        const { name, start, length, type } = def;
        const startIndex = start - 1;
        
        if (startIndex < 0 || startIndex >= line.length) {
          record[name] = getDefaultValue(type);
          continue;
        }

        const rawValue = line.substring(startIndex, startIndex + length).trim();

        if (rawValue) {
          hasData = true;
        }

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

      if (!hasData) {
        throw new Error('Record vuoto o senza dati validi');
      }

      return record as T;
    };
    
    // Elabora con gestione errori
    return await processWithErrorHandling(lines, processor, templateName);
    
  } catch (error: any) {
    // Errore fatale
    const stats: ImportStats = {
      totalRecords: 0,
      successfulRecords: 0,
      errorRecords: 1,
      warnings: [],
      errors: [error.message]
    };
    
    return { data: [], stats };
  }
} 