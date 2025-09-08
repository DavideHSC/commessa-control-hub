/**
 * Questo file contiene le funzioni di decodifica specifiche per il parser dei codici IVA.
 * La logica è basata sul parser Python di riferimento (`parser_codiciiva.py`).
 */

export function decodeTipoCalcolo(code: string): string {
  const mapping: Record<string, string> = {
    'O': 'Normale',
    'S': 'Scorporo',
    'E': 'Esente/Non imponibile',
    'A': 'Solo Imposta',
    'V': 'Ventilazione'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodePlafondAcquisti(code: string): string {
  const mapping: Record<string, string> = {
    'A': 'Acquisti Intracomunitari',
    'B': 'Acquisti Beni',
    'S': 'Acquisti Servizi',
    'T': 'Tutti gli Acquisti',
    'N': 'Nessun Plafond'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodePlafondVendite(code: string): string {
  const mapping: Record<string, string> = {
    'V': 'Vendite Intracomunitarie',
    'E': 'Esportazioni',
    'T': 'Tutte le Vendite',
    'N': 'Nessun Plafond'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeGestioneProRata(code: string): string {
  const mapping: Record<string, string> = {
    'P': 'Pro-rata Generale',
    'S': 'Pro-rata Speciale',
    'N': 'Nessun Pro-rata'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeComunicazioneVendite(code: string): string {
  const mapping: Record<string, string> = {
    'F': 'Fatture',
    'C': 'Corrispettivi',
    'T': 'Tutte le Operazioni',
    'N': 'Nessuna Comunicazione'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeComunicazioneAcquisti(code: string): string {
  const mapping: Record<string, string> = {
    'F': 'Fatture',
    'R': 'Ricevute',
    'A': 'Autofatture',
    'T': 'Tutte le Operazioni',
    'N': 'Nessuna Comunicazione'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeAcquistiCessioni(code: string): string {
  const mapping: Record<string, string> = {
    'A': 'Acquisti',
    'C': 'Cessioni',
    'T': 'Acquisti e Cessioni',
    'N': 'Nessuna Operazione'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeIndicatoreTerritorialeVendite(code: string): string {
  const mapping: Record<string, string> = {
    'IT': 'Italia',
    'EU': 'Unione Europea',
    'EX': 'Extra UE',
    'SM': 'San Marino',
    'VA': 'Vaticano'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeIndicatoreTerritorialeAcquisti(code: string): string {
  const mapping: Record<string, string> = {
    'IT': 'Italia',
    'EU': 'Unione Europea',
    'EX': 'Extra UE',
    'SM': 'San Marino',
    'VA': 'Vaticano'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeMetodoApplicare(code: string): string {
  const mapping: Record<string, string> = {
    'N': 'Normale',
    'M': 'Margine',
    'F': 'Forfetario',
    'S': 'Speciale'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodePercentualeForfetaria(code: string): string {
  const mapping: Record<string, string> = {
    '04': '4%',
    '10': '10%',
    '20': '20%',
    '40': '40%',
    '50': '50%'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeQuotaForfetaria(code: string): string {
  const mapping: Record<string, string> = {
    'I': 'Imposta',
    'C': 'Corrispettivo',
    'B': 'Base Imponibile'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeImposteIntrattenimenti(code: string): string {
  const mapping: Record<string, string> = {
    '10': '10%',
    '20': '20%',
    '25': '25%',
    'N': 'Nessuna Imposta'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}