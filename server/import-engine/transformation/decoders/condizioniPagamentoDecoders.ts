/**
 * Questo file contiene le funzioni di decodifica specifiche per il parser delle condizioni di pagamento.
 * La logica è basata sul parser Python di riferimento (`parser_codpagam.py`).
 */

export function decodeSuddivisione(code: string): string {
  const mapping: Record<string, string> = {
    'U': 'Unica Soluzione',
    'R': 'Rate Uguali',
    'P': 'Percentuali',
    'S': 'Scaglioni'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeInizioScadenza(code: string): string {
  const mapping: Record<string, string> = {
    'F': 'Fine Mese',
    'D': 'Data Documento',
    'C': 'Data Consegna',
    'R': 'Data Ricevimento'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}