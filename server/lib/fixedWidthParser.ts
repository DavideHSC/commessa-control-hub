/**
 * Definizione di un campo per il parser a larghezza fissa.
 */
export interface FieldDefinition {
  name: string;
  start: number;
  length: number;
  type?: 'string' | 'number' | 'date';
}

/**
 * Esegue il parsing di una stringa di testo a larghezza fissa.
 */
export function parseFixedWidth<T>(
  content: string,
  definitions: FieldDefinition[]
): T[] {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const results: T[] = [];

  for (const line of lines) {
    const parsedObject: { [key: string]: any } = {};

    for (const def of definitions) {
      const rawValue = line.substring(def.start, def.start + def.length).trim();
      
      switch (def.type) {
        case 'number':
          parsedObject[def.name] = parseFloat(rawValue.trim().replace(',', '.')) || 0;
          break;
        case 'date':
          // Formato atteso: DDMMYYYY. Gestisce stringhe vuote o non valide.
          const dateStr = rawValue.trim();
          if (dateStr && dateStr.length === 8) {
            const day = parseInt(dateStr.substring(0, 2), 10);
            const month = parseInt(dateStr.substring(2, 4), 10);
            const year = parseInt(dateStr.substring(4, 8), 10);
            
            if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              parsedObject[def.name] = new Date(year, month - 1, day);
            } else {
              parsedObject[def.name] = null;
            }
          } else {
            parsedObject[def.name] = null;
          }
          break;
        case 'string':
        default:
          parsedObject[def.name] = rawValue;
          break;
      }
    }
    results.push(parsedObject as T);
  }

  return results;
} 