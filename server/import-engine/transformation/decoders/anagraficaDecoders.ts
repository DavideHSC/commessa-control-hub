/**
 * ANAGRAFICHE DECODERS
 * Decodifica dei valori legacy del file A_CLIFOR.TXT
 * 
 * Fonte: parser_a_clifor copy.py
 * File: A_CLIFOR.TXT
 */

export interface TipoConto {
  codice: string;
  descrizione: string;
  isCliente: boolean;
  isFornitore: boolean;
}

export interface TipoSoggetto {
  codice: string;
  descrizione: string;
  isPersonaFisica: boolean;
}

export interface Sesso {
  codice: string;
  descrizione: string;
}

export interface Quadro770 {
  codice: string;
  descrizione: string;
}

export interface TipoRitenuta {
  codice: string;
  descrizione: string;
}

export interface Contributo335 {
  codice: string;
  descrizione: string;
}

/**
 * Decodifica del tipo conto (C/F/E)
 */
export function decodeTipoConto(codice: string): TipoConto {
  const tipiConto: Record<string, TipoConto> = {
    'C': {
      codice: 'C',
      descrizione: 'Cliente',
      isCliente: true,
      isFornitore: false
    },
    'F': {
      codice: 'F', 
      descrizione: 'Fornitore',
      isCliente: false,
      isFornitore: true
    },
    'E': {
      codice: 'E',
      descrizione: 'Entrambi (Cliente e Fornitore)',
      isCliente: true,
      isFornitore: true
    }
  };

  return tipiConto[codice] || {
    codice,
    descrizione: `Tipo ${codice}`,
    isCliente: false,
    isFornitore: false
  };
}

/**
 * Decodifica del tipo soggetto (0/1)
 */
export function decodeTipoSoggetto(codice: string): TipoSoggetto {
  const tipiSoggetto: Record<string, TipoSoggetto> = {
    '0': {
      codice: '0',
      descrizione: 'Persona Fisica',
      isPersonaFisica: true
    },
    '1': {
      codice: '1',
      descrizione: 'Soggetto Diverso (Società/Ente)',
      isPersonaFisica: false
    }
  };

  return tipiSoggetto[codice] || {
    codice,
    descrizione: `Tipo ${codice}`,
    isPersonaFisica: false
  };
}

/**
 * Decodifica del sesso (M/F)
 */
export function decodeSesso(codice: string): Sesso {
  const sessi: Record<string, Sesso> = {
    'M': {
      codice: 'M',
      descrizione: 'Maschio'
    },
    'F': {
      codice: 'F',
      descrizione: 'Femmina'
    }
  };

  return sessi[codice] || {
    codice,
    descrizione: codice
  };
}

/**
 * Decodifica del quadro 770 (0/1/2)
 */
export function decodeQuadro770(codice: string): Quadro770 {
  const quadri: Record<string, Quadro770> = {
    '0': {
      codice: '0',
      descrizione: 'Lavoro autonomo'
    },
    '1': {
      codice: '1', 
      descrizione: 'Provvigioni'
    },
    '2': {
      codice: '2',
      descrizione: 'Lavoro autonomo imposta'
    }
  };

  return quadri[codice] || {
    codice,
    descrizione: codice
  };
}

/**
 * Decodifica del tipo ritenuta (A/I/M)
 */
export function decodeTipoRitenuta(codice: string): TipoRitenuta {
  const tipi: Record<string, TipoRitenuta> = {
    'A': {
      codice: 'A',
      descrizione: "A titolo d'acconto"
    },
    'I': {
      codice: 'I', 
      descrizione: "A titolo d'imposta"
    },
    'M': {
      codice: 'M',
      descrizione: 'Manuale'
    }
  };

  return tipi[codice] || {
    codice,
    descrizione: codice
  };
}

/**
 * Decodifica del contributo L.335/95 (0/1/2/3)
 */
export function decodeContributo335(codice: string): Contributo335 {
  const contributi: Record<string, Contributo335> = {
    '0': {
      codice: '0',
      descrizione: 'Non soggetto'
    },
    '1': {
      codice: '1',
      descrizione: 'Soggetto'
    },
    '2': {
      codice: '2', 
      descrizione: 'Soggetto con imponibile manuale'
    },
    '3': {
      codice: '3',
      descrizione: 'Soggetto con calcolo manuale'
    }
  };

  return contributi[codice] || {
    codice,
    descrizione: codice
  };
}

/**
 * Formatta data di nascita da GGMMAAAA a YYYY-MM-DD
 */
export function formatDataNascita(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) {
    return '';
  }
  
  try {
    const gg = dateStr.substring(0, 2);
    const mm = dateStr.substring(2, 4);
    const aaaa = dateStr.substring(4, 8);
    
    // Validazione base
    const day = parseInt(gg, 10);
    const month = parseInt(mm, 10);
    const year = parseInt(aaaa, 10);
    
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
      return '';
    }
    
    return `${aaaa}-${mm}-${gg}`;
  } catch {
    return '';
  }
}

/**
 * Formatta e valida codice fiscale
 */
export function formatCodiceFiscale(cf: string): string {
  if (!cf) return '';
  
  const cleanCf = cf.trim().toUpperCase();
  
  // Codice fiscale persona fisica (16 caratteri alfanumerici)
  if (cleanCf.length === 16 && /^[A-Z0-9]{16}$/.test(cleanCf)) {
    return cleanCf;
  }
  
  // Partita IVA come codice fiscale (11 cifre numeriche)
  if (cleanCf.length === 11 && /^\d{11}$/.test(cleanCf)) {
    return cleanCf;
  }
  
  return cleanCf;
}

/**
 * Formatta e valida partita IVA
 */
export function formatPartitaIva(piva: string): string {
  if (!piva) return '';
  
  const cleanPiva = piva.trim();
  
  // Partita IVA italiana (11 cifre numeriche)
  if (cleanPiva.length === 11 && /^\d{11}$/.test(cleanPiva)) {
    return cleanPiva;
  }
  
  return cleanPiva;
}

/**
 * Converte flag 'X' in boolean
 */
export function decodeFlagBoolean(flag: string): boolean {
  return flag?.trim().toUpperCase() === 'X';
}

/**
 * Formatta nome completo per persona fisica
 */
export function formatNomeCompleto(nome: string, cognome: string, denominazione: string, isPersonaFisica: boolean): string {
  if (isPersonaFisica) {
    const nomeClean = nome?.trim() || '';
    const cognomeClean = cognome?.trim() || '';
    
    if (nomeClean && cognomeClean) {
      return `${nomeClean} ${cognomeClean}`;
    } else if (cognomeClean) {
      return cognomeClean;
    } else if (nomeClean) {
      return nomeClean;
    }
  }
  
  return denominazione?.trim() || '';
}

/**
 * Determina sottoconto attivo basato su tipo conto
 */
export function determineSottocontoAttivo(
  tipoConto: string,
  sottocontoCliente: string,
  sottocontoFornitore: string
): string {
  const scCliente = sottocontoCliente?.trim() || '';
  const scFornitore = sottocontoFornitore?.trim() || '';
  
  switch (tipoConto) {
    case 'C':
      return scCliente;
    case 'F':
      return scFornitore;
    case 'E':
      if (scCliente && scFornitore) {
        return `C:${scCliente}/F:${scFornitore}`;
      } else if (scCliente) {
        return scCliente;
      } else if (scFornitore) {
        return scFornitore;
      }
      break;
  }
  
  return scCliente || scFornitore || '';
} 