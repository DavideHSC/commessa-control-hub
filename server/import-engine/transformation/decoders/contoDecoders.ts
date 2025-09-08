import { TipoConto } from '@prisma/client';

/**
 * @file Contiene i decodificatori di business per i dati grezzi del piano dei conti.
 * Questi decodificatori trasformano i valori stringa in tipi più significativi
 * o in descrizioni leggibili, applicando la logica di business specifica.
 */

// === PIANO DEI CONTI (parser_contigen.py) ===

export function decodeLivello(livello: string): string {
  const mapping: Record<string, string> = {
    '1': 'Mastro',
    '2': 'Conto',
    '3': 'Sottoconto'
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

/**
 * Formatta il codice del conto in base al suo livello gerarchico.
 * @param codifica Il codice grezzo.
 * @param livello Il livello ('1', '2', '3').
 * @returns Il codice formattato.
 */
export function formatCodificaGerarchica(codifica?: string | null, livello?: string | null): string {
    if (!codifica) return "";
    
    const cleanCode = codifica.trim();
    if (livello === '1') {  // Mastro
        return cleanCode.slice(0, 2) || cleanCode;
    } else if (livello === '2') {  // Conto
        return cleanCode.slice(0, 4) || cleanCode;
    }
    return cleanCode; // Sottoconto o default
}

/**
 * Determina il TipoConto enum in base alla logica di business.
 * @param tipoChar Il carattere che identifica il tipo (P, E, C, F, O).
 * @param codice Il codice del conto, usato per distinguere Costo/Ricavo (fallback).
 * @param gruppo Il campo GRUPPO dal tracciato CONTIGEN (A, C, P, R) - prioritario per conti economici.
 * @returns L'enum TipoConto corrispondente.
 */
export function determineTipoConto(tipoChar?: string | null, codice?: string | null, gruppo?: string | null): TipoConto {
    const tipo = tipoChar?.trim().toUpperCase();
    const gruppoNorm = gruppo?.trim().toUpperCase();
    
    switch (tipo) {
        case 'P': return TipoConto.Patrimoniale;
        case 'E': 
            // Usa il campo GRUPPO per distinguere Costo/Ricavo (logica corretta dal tracciato)
            if (gruppoNorm === 'C') {
                return TipoConto.Costo;
            }
            if (gruppoNorm === 'R') {
                return TipoConto.Ricavo;
            }
            // Fallback alla logica precedente basata sui prefissi del codice
            if (codice?.startsWith('6')) { // I costi iniziano per 6
                return TipoConto.Costo;
            }
            if (codice?.startsWith('7')) { // I ricavi iniziano per 7
                return TipoConto.Ricavo;
            }
            return TipoConto.Economico; // Default per conti economici non specificati
        case 'C': return TipoConto.Cliente;
        case 'F': return TipoConto.Fornitore;
        case 'O': return TipoConto.Ordine;
        default: return TipoConto.Patrimoniale; // Default conservativo
    }
}

/**
 * Applica tutti i decodificatori semantici a un record del piano dei conti.
 * @param record Dati grezzi con campi normalizzati.
 * @returns Un oggetto con i campi decodificati.
 */
export function getDecodedFields(record: { [key: string]: string | null }) {
    return {
        livelloDesc: decodeLivello(record.livello ?? ''),
        tipoDesc: decodeTipoConto(record.tipoChar ?? ''),
        gruppoDesc: decodeGruppo(record.gruppo ?? ''),
        controlloSegnoDesc: decodeControlloSegno(record.controlloSegno ?? ''),
    };
}