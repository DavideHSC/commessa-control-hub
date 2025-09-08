/**
 * TYPE-SAFE FIXED WIDTH PARSER
 * Wrapper type-safe del parser core.
 */
import { parseFixedWidth as parseFixedWidthCore } from '../../core/utils/fixedWidthParser.js';
import type { ImportStats, ParseResult } from '../../core/utils/fixedWidthParser.js';

export interface TypeSafeParseResult<T = Record<string, unknown>> {
  data: T[];
  stats: ImportStats;
}

/**
 * Parser type-safe per file a larghezza fissa.
 * Chiama il parser core passando il nome del template e l'eventuale fileIdentifier.
 */
export async function parseFixedWidth<T = Record<string, unknown>>(
  fileContent: string,
  templateName: string,
  fileIdentifier?: string // Aggiunto il parametro opzionale
): Promise<TypeSafeParseResult<T>> {
  
  // Chiama il parser core, passando tutti i parametri
  const result: ParseResult<T> = await parseFixedWidthCore(fileContent, templateName, fileIdentifier);
  
  return {
    data: result.data,
    stats: result.stats
  };
}