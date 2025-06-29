/**
 * TYPE-SAFE FIXED WIDTH PARSER
 * Wrapper type-safe del parser legacy esistente
 * 
 * Utilizza il parseFixedWidth legacy ma con tipizzazione migliorata
 */

import { parseFixedWidth as legacyParseBasic, parseFixedWidthRobust } from '../../../lib/fixedWidthParser';
import type { ImportStats, ParseResult } from '../../../lib/fixedWidthParser';
import { writeFile } from 'fs/promises';
import path from 'path';

export interface TypeSafeParseResult<T = Record<string, unknown>> {
  data: T[];
  stats: ImportStats;
}

/**
 * Parser type-safe per file a larghezza fissa
 * Wrapper del parser legacy esistente
 */
export async function parseFixedWidth<T = Record<string, unknown>>(
  fileContent: string,
  templateName: string
): Promise<TypeSafeParseResult<T>> {
  
  // Crea un file temporaneo per il parser legacy che richiede un file path
  const tempFilePath = path.join(process.cwd(), 'uploads', `temp_${Date.now()}.txt`);
  
  try {
    await writeFile(tempFilePath, fileContent, 'utf-8');
    
    // Utilizza il parser legacy robusto che accetta templateName
    const result: ParseResult<T> = await parseFixedWidthRobust(tempFilePath, [], templateName);
    
    return {
      data: result.data,
      stats: result.stats
    };
  } finally {
    // Cleanup del file temporaneo
    try {
      await import('fs/promises').then(fs => fs.unlink(tempFilePath));
    } catch (error) {
      console.warn(`Impossibile eliminare file temporaneo: ${tempFilePath}`);
    }
  }
} 