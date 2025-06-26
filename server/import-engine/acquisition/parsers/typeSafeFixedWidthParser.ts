import type { FieldDefinition } from '@prisma/client';

/**
 * Esegue il parsing di un contenuto testuale a larghezza fissa in un array di oggetti tipizzati.
 * @param content Il contenuto del file da parsare.
 * @param definitions Le definizioni dei campi che guidano il parsing.
 * @returns Un array di oggetti del tipo generico `T`.
 */
export function parse<T>(
  content: string,
  definitions: FieldDefinition[]
): T[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const results: T[] = [];

  for (const line of lines) {
    const record: Record<string, unknown> = {};

    for (const def of definitions) {
      if (def.fieldName) {
        // Le posizioni start sono 1-based, convertiamo in 0-based
        const start = def.start - 1;
        const end = start + def.length;
        const value = line.substring(start, end);
        record[def.fieldName] = value;
      }
    }
    results.push(record as T);
  }

  return results;
} 