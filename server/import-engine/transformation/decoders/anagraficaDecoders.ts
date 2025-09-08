/**
 * ANAGRAFICHE DECODERS
 * Decodifica dei valori legacy del file A_CLIFOR.TXT
 * 
 * Fonte: parser_a_clifor.py
 * File: A_CLIFOR.TXT
 */

export function decodeTipoContoAnagrafica(code: string): string {
  const mapping: Record<string, string> = {
    'C': 'Cliente',
    'F': 'Fornitore',
    'E': 'Entrambi (Cliente e Fornitore)', // CORRETTO: E = Entrambi
    '': 'Non specificato'
  };
  return mapping[code?.trim()] || `Tipo ${code}`;
}

export function decodeTipoSoggetto(code: string): string {
  const mapping: Record<string, string> = {
    '0': 'Persona Fisica',           // CORRETTO: parser Python usa '0'
    '1': 'Soggetto Diverso (Società/Ente)', // CORRETTO: parser Python usa '1'
    '': 'Non specificato'
  };
  return mapping[code?.trim()] || `Tipo ${code}`;
}

export function decodeSesso(code: string): string {
  const mapping: Record<string, string> = {
    'M': 'Maschio',
    'F': 'Femmina',
    '': 'Non specificato'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeQuadro770(code: string): string {
  const mapping: Record<string, string> = {
    'A': 'Quadro A',
    'B': 'Quadro B',
    'C': 'Quadro C',
    'D': 'Quadro D',
    'N': 'Non Applicabile'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeTipoRitenuta(code: string): string {
  const mapping: Record<string, string> = {
    'LP': 'Lavoro Professionale',
    'LD': 'Lavoro Dipendente',
    'AU': 'Lavoro Autonomo',
    'PR': 'Provvigioni',
    'AL': 'Altri Redditi'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeContributoPrevid335(code: string): string {
  const mapping: Record<string, string> = {
    'SI': 'Soggetto',
    'NO': 'Non Soggetto',
    'ES': 'Esente'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

/**
 * Determina quale sottoconto è attivo basandosi sulla logica del parser Python
 * Riferimento: parser_a_clifor.py -> determine_sottoconto_attivo
 */
export function determineSottocontoAttivo(
  tipoConto: string, 
  sottocontoCliente?: string | null, 
  sottocontoFornitore?: string | null
): string {
    const cleanCliente = sottocontoCliente?.trim();
    const cleanFornitore = sottocontoFornitore?.trim();
    
    if (tipoConto === 'C' && cleanCliente) {
        return cleanCliente;
    } 
    if (tipoConto === 'F' && cleanFornitore) {
        return cleanFornitore;
    } 
    if (tipoConto === 'E') {
        if (cleanCliente && cleanFornitore) {
            return `C:${cleanCliente}/F:${cleanFornitore}`;
        }
        if (cleanCliente) {
            return cleanCliente;
        }
        if (cleanFornitore) {
            return cleanFornitore;
        }
    }
    
    return cleanCliente || cleanFornitore || "";
}