/**
 * @file Contiene funzioni di utilità di parsing generiche e consolidate,
 * per la conversione di stringhe in tipi di dati primitivi come date, booleani e numeri.
 * Questo modulo serve come unica fonte di verità per queste operazioni.
 */

/**
 * Converte una stringa in formato 'DDMMYYYY' o 'YYYYMMDD' in un oggetto Date.
 * Gestisce robustamente valori nulli, stringhe vuote o formati non validi.
 * @param dateStr La stringa di data da parsare.
 * @returns Un oggetto Date o null se il parsing fallisce.
 */
export function parseDateString(dateStr: string | null | undefined): Date | null {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim().length !== 8 || dateStr.trim() === '00000000') {
        return null;
    }

    try {
        const cleanDateStr = dateStr.trim();
        // Supporta sia DDMMYYYY che YYYYMMDD
        const day = cleanDateStr.startsWith('20') ? parseInt(cleanDateStr.substring(6, 8)) : parseInt(cleanDateStr.substring(0, 2));
        const month = cleanDateStr.startsWith('20') ? parseInt(cleanDateStr.substring(4, 6)) : parseInt(cleanDateStr.substring(2, 4));
        const year = cleanDateStr.startsWith('20') ? parseInt(cleanDateStr.substring(0, 4)) : parseInt(cleanDateStr.substring(4, 8));
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return null;
        }

        const date = new Date(Date.UTC(year, month - 1, day));
        
        // Ulteriore controllo di validità per evitare overflow (es. 32/13/2023)
        if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
            return date;
        }
        
        return null;
    } catch (error) {
        console.warn(`Errore nella conversione della data: ${dateStr}`);
        return null;
    }
}

/**
 * Converte un flag stringa in un booleano, con una logica allineata ai parser legacy.
 * Gestisce diversi caratteri comuni per 'true' (es. X, S, Y, 1, V).
 * @param flag La stringa da parsare.
 * @returns `true`, `false`, o `null` se l'input è nullo o vuoto.
 */
export function parseBoolean(flag: string | null | undefined): boolean | null {
    if (flag === null || flag === undefined) {
        return null;
    }
    const upperFlag = flag.trim().toUpperCase();
    if (upperFlag === '') {
        return null;
    }

    const trueValues = ['X', 'S', 'Y', '1', 'V', 'TRUE']; 
    if (trueValues.includes(upperFlag)) {
        return true;
    }

    return false;
}

/**
 * Converte una stringa numerica in un numero in virgola mobile.
 * Gestisce correttamente sia la virgola che il punto come separatore decimale.
 * @param value La stringa da parsare.
 * @returns Un numero o null se il parsing fallisce.
 */
export function parseDecimal(value: string | null | undefined): number | null {
    if (value === null || value === undefined) {
        return null;
    }
    const cleaned = value.trim().replace(',', '.');
    if (cleaned === '') {
        return null;
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/**
 * Converte una stringa numerica in un numero intero.
 * @param value La stringa da parsare.
 * @returns Un numero intero o null se il parsing fallisce.
 */
export function parseInteger(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === '') {
      return null;
  }
  try {
    const num = parseInt(value.trim(), 10);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}