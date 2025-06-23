import moment from 'moment';

/**
 * Definizione di un campo per il parser a larghezza fissa.
 */
export interface FieldDefinition {
  name: string;
  start: number;
  length: number;
  type?: 'string' | 'number' | 'date';
}

function getDefaultValue(type?: 'string' | 'number' | 'date') {
    switch (type) {
        case 'number':
            return 0;
        case 'date':
            return null;
        case 'string':
        default:
            return '';
    }
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
          case 'number':
            // Sostituisce la virgola con il punto per il parsing corretto dei float
            record[name] = parseFloat(rawValue.replace(',', '.'));
            break;
          case 'date':
            if (rawValue === '00000000' || !rawValue) {
              record[name] = null;
            } else {
              const parsedDate = moment(rawValue, 'DDMMYYYY');
              record[name] = parsedDate.isValid() ? parsedDate.toDate() : null;
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