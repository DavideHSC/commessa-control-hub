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

  lines.forEach((line, index) => {
    console.log(`[Parser] Processo la riga ${index + 1}: "${line}"`);
    const parsedObject: { [key: string]: any } = {};
    let hasData = false;

    for (const def of definitions) {
      const { name, start, length, type } = def;
      // I sistemi di tracciati record sono spesso 1-based, quindi aggiustiamo
      const startIndex = start - 1; 
      
      if (startIndex < 0 || startIndex >= line.length) {
        console.warn(`[Parser] Riga ${index + 1}: L'indice di inizio ${start} per il campo '${name}' è fuori dai limiti della riga (lunghezza ${line.length}). Salto il campo.`);
        parsedObject[name] = getDefaultValue(type);
        continue;
      }

      const rawValue = line.substring(startIndex, startIndex + length).trim();
      console.log(`[Parser] Riga ${index + 1}, Campo '${name}': Estratto valore grezzo "${rawValue}" (start: ${start}, length: ${length})`);

      if (rawValue) {
        hasData = true;
      }

      try {
        switch (type) {
          case 'number':
            parsedObject[name] = parseFloat(rawValue.replace(',', '.')) || 0;
            break;
          case 'date':
            // Formato atteso: DDMMYYYY. Gestisce stringhe vuote o non valide.
            const dateStr = rawValue.trim();
            if (dateStr && dateStr.length === 8) {
              const day = parseInt(dateStr.substring(0, 2), 10);
              const month = parseInt(dateStr.substring(2, 4), 10);
              const year = parseInt(dateStr.substring(4, 8), 10);
              
              if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                parsedObject[name] = new Date(year, month - 1, day);
              } else {
                parsedObject[name] = null;
              }
            } else {
              parsedObject[name] = null;
            }
            break;
          case 'string':
          default:
            parsedObject[name] = rawValue;
            break;
        }
      } catch (e) {
        console.error(`[Parser] Riga ${index + 1}: Errore nella conversione del campo '${name}' con valore "${rawValue}" al tipo '${type}'.`, e);
        parsedObject[name] = getDefaultValue(type);
      }
    }

    if (hasData) {
      console.log(`[Parser] Riga ${index + 1}: Record parsato:`, parsedObject);
      results.push(parsedObject as T);
    } else {
      console.warn(`[Parser] Riga ${index + 1}: Saltata perché non contiene dati validi.`);
    }
  });

  console.log(`[Parser] Parsing completato. ${results.length} record estratti.`);
  return results;
}

function getDefaultValue(type: 'string' | 'number' | 'date' | undefined) {
  switch(type) {
    case 'number': return null;
    case 'date': return null;
    case 'string':
    default: return '';
  }
} 