import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import * as fs from 'fs/promises';
import * as iconv from 'iconv-lite';

const prisma = new PrismaClient();

/**
 * Definizione di un campo per il parser a larghezza fissa.
 */
export interface FieldDefinition {
  fieldName: string | null;
  start: number;
  length: number;
  end?: number;
  type?: 'string' | 'number' | 'date' | 'boolean';
  format?: 'percentage' | 'date:DDMMYYYY' | 'boolean';
  isKey?: boolean;
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
  createdRecords?: number;
  updatedRecords?: number;
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

// Configurazioni di validazione per i template (Fase 2.2)
const RECORD_VALIDATIONS: Record<string, RecordValidation> = {
  'causali': { expectedLength: 171, required: true },
  'codici_iva': { expectedLength: 162, required: true },
  'anagrafica_clifor': { expectedLength: 338, required: true },
  'piano_dei_conti': { expectedLength: 388, required: true },
  'condizioni_pagamento': { expectedLength: 68, required: true }
};

function getDefaultValue(): string {
    return '';
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
        stats.warnings.push({
          row: i + 1,
          message: warning,
          data: line
        });
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
      const errorMessage = (error as Error).message || 'Errore di parsing sconosciuto';
      stats.errors.push({
        row: i + 1,
        message: errorMessage,
        data: line
      });
      console.warn(`Riga ${i + 1}: Errore - ${errorMessage}`);
      
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
        record[name] = getDefaultValue();
        continue;
      }

      const rawValue = line.substring(startIndex, startIndex + length).trim();

      if (rawValue) {
        hasData = true;
      }

      record[name] = rawValue;
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
    errors: []
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
        fieldName: field.fieldName,
        start: field.start,
        length: field.length,
        end: field.end, // Ensure 'end' is included
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
        const { fieldName, start, length, format } = def;
        const name = fieldName ?? 'unknown'; // Fallback per il nome del campo
        const startIndex = start - 1;
        
        if (startIndex < 0 || startIndex >= line.length) {
          record[name] = getDefaultValue();
          continue;
        }

        const rawValue = line.substring(startIndex, startIndex + length).trim();

        if (rawValue) {
          hasData = true;
        }

        record[name] = rawValue;
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
      errors: [{ row: 0, message: (error as Error).message, data: null }]
    };
    
    return { data: [], stats };
  }
} 