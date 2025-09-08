/**
 * Questo file contiene le funzioni di decodifica specifiche per il parser delle causali contabili.
 * La logica è basata sul parser Python di riferimento (`parser_causali.py`).
 */

export function decodeTipoMovimento(code: string): string {
  const mapping: Record<string, string> = {
    'C': 'Contabile',
    'I': 'Contabile/Iva',
    '': 'Non specificato'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}

export function decodeTipoAggiornamento(code: string): string {
  const mapping: Record<string, string> = {
    'I': 'Saldo Iniziale',
    'P': 'Saldo Progressivo', 
    'F': 'Saldo Finale',
    '': 'Non specificato'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}

export function decodeTipoRegistroIva(code: string): string {
  const mapping: Record<string, string> = {
    'A': 'Acquisti',
    'C': 'Corrispettivi',
    'V': 'Vendite',
    '': 'Non applicabile'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}

export function decodeSegnoMovimentoIva(code: string): string {
  const mapping: Record<string, string> = {
    'I': 'Incrementa (+)',
    'D': 'Decrementa (-)',
    '': 'Non applicabile'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}

export function decodeTipoAutofattura(code: string): string {
  const mapping: Record<string, string> = {
    'A': 'Altre Gestioni',
    'C': 'CEE',
    'E': 'Reverse Charge',
    'R': 'RSM',
    '': 'Non applicabile'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}

export function decodeIvaEsigibilita(code: string): string {
  const mapping: Record<string, string> = {
    'N': 'Nessuna',
    'E': 'Emessa/Ricevuta Fattura',
    'I': 'Incasso/Pagamento Fattura',
    '': 'Non specificato'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}

export function decodeGestionePartite(code: string): string {
  const mapping: Record<string, string> = {
    'N': 'Nessuna',
    'A': 'Creazione + Chiusura automatica',
    'C': 'Creazione',
    'H': 'Creazione + Chiusura',
    '': 'Non specificato'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}

export function decodeGestioneRitenuteEnasarco(code: string): string {
  const mapping: Record<string, string> = {
    'R': 'Ritenuta',
    'E': 'Enasarco',
    'T': 'Ritenuta/Enasarco',
    '': 'Non applicabile'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}

export function decodeTipoMovimentoSemplificata(code: string): string {
  const mapping: Record<string, string> = {
    'C': 'Costi',
    'R': 'Ricavi',
    '': 'Non applicabile'
  };
  return mapping[code?.trim()] || `Codice sconosciuto: ${code}`;
}