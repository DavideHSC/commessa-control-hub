/**
 * === FASE 3: DECODIFICHE SEMANTICHE ===
 * Basate sui parser Python per interpretare correttamente i codici
 * 
 * Riferimenti:
 * - parser_causali.py: decode_tipo_movimento, decode_tipo_aggiornamento, etc.
 * - parser_codiciiva.py: decode_tipo_calcolo, decode_plafond_*, etc.
 * - parser_contigen.py: decode_livello, decode_tipo, etc.
 * - parser_a_clifor.py: decode_tipo_conto, decode_tipo_soggetto, etc.
 */

// === CAUSALI CONTABILI (parser_causali.py) ===

export function decodeTipoMovimento(code: string): string {
  const mapping: Record<string, string> = {
    'C': 'Solo Contabile',
    'I': 'Contabile e IVA',
    'V': 'Solo IVA',
    'E': 'Solo Extracontabile',
    'A': 'Contabile, IVA e Extracontabile',
    'R': 'Ritenute'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeTipoAggiornamento(code: string): string {
  const mapping: Record<string, string> = {
    'A': 'Automatico',
    'M': 'Manuale',
    'S': 'Semi-automatico'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeTipoRegistroIva(code: string): string {
  const mapping: Record<string, string> = {
    'V': 'Vendite',
    'A': 'Acquisti',
    'C': 'Corrispettivi',
    'R': 'Reverse Charge'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeSegnoMovimentoIva(code: string): string {
  const mapping: Record<string, string> = {
    'D': 'Dare',
    'A': 'Avere',
    'N': 'Neutro'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeTipoAutofattura(code: string): string {
  const mapping: Record<string, string> = {
    'RC': 'Reverse Charge',
    'AU': 'Autofattura Standard',
    'SP': 'Split Payment',
    'IN': 'Intracomunitaria'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeIvaEsigibilita(code: string): string {
  const mapping: Record<string, string> = {
    'I': 'Immediata',
    'D': 'Differita',
    'S': 'Split Payment'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeGestionePartite(code: string): string {
  const mapping: Record<string, string> = {
    'A': 'Automatica',
    'M': 'Manuale',
    'N': 'Nessuna gestione'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeGestioneRitenuteEnasarco(code: string): string {
  const mapping: Record<string, string> = {
    'A': 'Automatica',
    'M': 'Manuale',
    'N': 'Nessuna'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

// === CODICI IVA (parser_codiciiva.py) ===

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

// === PIANO DEI CONTI (parser_contigen.py) ===

export function decodeLivello(livello: string): string {
  const mapping: Record<string, string> = {
    '1': 'Mastro',
    '2': 'Categoria',
    '3': 'Conto',
    '4': 'Sottoconto',
    '5': 'Dettaglio'
  };
  return mapping[livello?.trim()] || livello?.trim() || '';
}

export function decodeTipoConto(tipo: string): string {
  const mapping: Record<string, string> = {
    'P': 'Patrimoniale',
    'E': 'Economico',
    'O': 'Ordine',
    'C': 'Costi',
    'R': 'Ricavi'
  };
  return mapping[tipo?.trim()] || tipo?.trim() || '';
}

export function decodeGruppo(gruppo: string): string {
  const mapping: Record<string, string> = {
    'A': 'Attivo',
    'P': 'Passivo',
    'C': 'Costi',
    'R': 'Ricavi',
    'O': 'Ordine'
  };
  return mapping[gruppo?.trim()] || gruppo?.trim() || '';
}

export function decodeControlloSegno(segno: string): string {
  const mapping: Record<string, string> = {
    'D': 'Solo Dare',
    'A': 'Solo Avere',
    'T': 'Dare e Avere',
    'N': 'Nessun Controllo'
  };
  return mapping[segno?.trim()] || segno?.trim() || '';
}

export function formatCodificaGerarchica(codifica: string, livello: string): string {
  if (!codifica) return '';
  
  const liv = parseInt(livello || '1');
  const code = codifica.trim();
  
  switch (liv) {
    case 1: return code; // Mastro
    case 2: return code; // Categoria
    case 3: return code; // Conto
    case 4: return code; // Sottoconto
    case 5: return code; // Dettaglio
    default: return code;
  }
}

// === CLIENTI/FORNITORI (parser_a_clifor.py) ===

export function decodeTipoContoAnagrafica(code: string): string {
  const mapping: Record<string, string> = {
    'C': 'Cliente',
    'F': 'Fornitore',
    'CF': 'Cliente e Fornitore',
    'A': 'Altro'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeTipoSoggetto(code: string): string {
  const mapping: Record<string, string> = {
    'PF': 'Persona Fisica',
    'PG': 'Persona Giuridica',
    'DI': 'Ditta Individuale',
    'PA': 'Pubblica Amministrazione',
    'AS': 'Associazione',
    'EN': 'Ente'
  };
  return mapping[code?.trim()] || code?.trim() || '';
}

export function decodeSesso(code: string): string {
  const mapping: Record<string, string> = {
    'M': 'Maschio',
    'F': 'Femmina'
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

// === CONDIZIONI PAGAMENTO (parser_codpagam.py) ===

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

// === UTILITY FUNCTIONS ===

/**
 * Decodifica generica per valori booleani
 */
export function decodeBooleanFlag(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.trim().toUpperCase() === 'X' || value.trim().toUpperCase() === 'TRUE' || value.trim() === '1';
  }
  return false;
}

/**
 * Decodifica data da stringa DDMMYYYY
 */
export function decodeDateFromString(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '' || dateStr === '00000000') {
    return null;
  }
  
  try {
    const cleaned = dateStr.trim();
    if (cleaned.length === 8) {
      const day = cleaned.substring(0, 2);
      const month = cleaned.substring(2, 4);
      const year = cleaned.substring(4, 8);
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Decodifica numero decimale con gestione errori
 */
export function decodeDecimal(value: string, decimals: number = 2): number | null {
  if (!value || value.trim() === '') return null;
  
  try {
    const cleanValue = value.trim().replace(',', '.');
    const numericValue = parseFloat(cleanValue);
    
    if (isNaN(numericValue)) return null;
    
    return decimals > 0 ? 
      Math.round(numericValue * Math.pow(10, decimals)) / Math.pow(10, decimals) : 
      numericValue;
  } catch {
    return null;
  }
}

/**
 * Decodifica numero intero con gestione errori
 */
export function decodeInteger(value: string): number | null {
  if (!value || value.trim() === '') return null;
  
  try {
    const numericValue = parseInt(value.trim());
    return isNaN(numericValue) ? null : numericValue;
  } catch {
    return null;
  }
} 