/**
 * Questo file contiene le funzioni di decodifica specifiche per il parser delle causali contabili.
 * La logica è basata sul parser Python di riferimento (`parser_causali.py`).
 */

export function decodeTipoMovimento(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'C': 'Contabile',
    'I': 'Contabile/Iva',
  };
  return mapping[code?.trim() ?? ''] || `Codice sconosciuto: ${code}`;
}

export function decodeTipoAggiornamento(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'I': 'Saldo Iniziale',
    'P': 'Saldo Progressivo',
    'F': 'Saldo Finale',
  };
  return mapping[code?.trim() ?? ''] || `Codice sconosciuto: ${code}`;
}

export function decodeTipoRegistroIva(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'A': 'Acquisti',
    'C': 'Corrispettivi',
    'V': 'Vendite',
  };
  return mapping[code?.trim() ?? ''] || 'Non applicabile';
}

export function decodeSegnoMovimentoIva(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'I': 'Incrementa (+)',
    'D': 'Decrementa (-)',
  };
  return mapping[code?.trim() ?? ''] || 'Non applicabile';
}

export function decodeTipoAutofattura(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'A': 'Altre Gestioni',
    'C': 'CEE',
    'E': 'Reverse Charge',
    'R': 'RSM',
  };
  return mapping[code?.trim() ?? ''] || 'Non applicabile';
}

export function decodeIvaEsigibilitaDifferita(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'N': 'Nessuna',
    'E': 'Emessa/Ricevuta Fattura',
    'I': 'Incasso/Pagamento Fattura',
  };
  return mapping[code?.trim() ?? ''] || 'Non specificato';
}

export function decodeGestionePartite(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'N': 'Nessuna',
    'A': 'Creazione + Chiusura automatica',
    'C': 'Creazione',
    'H': 'Creazione + Chiusura',
  };
  return mapping[code?.trim() ?? ''] || 'Non specificato';
}

export function decodeGestioneRitenuteEnasarco(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'R': 'Ritenuta',
    'E': 'Enasarco',
    'T': 'Ritenuta/Enasarco',
  };
  return mapping[code?.trim() ?? ''] || 'Non applicabile';
}

export function decodeTipoMovimentoSemplificata(code: string | undefined): string {
  const mapping: { [key: string]: string } = {
    'C': 'Costi',
    'R': 'Ricavi',
  };
  return mapping[code?.trim() ?? ''] || 'Non applicabile';
} 