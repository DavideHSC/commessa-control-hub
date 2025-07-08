import { TipoConto } from '@prisma/client';
import * as decoders from '../../../lib/businessDecoders';

/**
 * @file Contiene i decodificatori di business per i dati grezzi del piano dei conti.
 * Questi decodificatori trasformano i valori stringa in tipi più significativi
 * o in descrizioni leggibili, applicando la logica di business specifica.
 */

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
 * @param codice Il codice del conto, usato per distinguere Costo/Ricavo.
 * @returns L'enum TipoConto corrispondente.
 */
export function determineTipoConto(tipoChar?: string | null, codice?: string | null): TipoConto {
    const tipo = tipoChar?.trim().toUpperCase();
    
    switch (tipo) {
        case 'P': return TipoConto.Patrimoniale;
        case 'E': 
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
        livelloDesc: decoders.decodeLivello(record.livello ?? ''),
        tipoDesc: decoders.decodeTipoConto(record.tipoChar ?? ''),
        gruppoDesc: decoders.decodeGruppo(record.gruppo ?? ''),
        controlloSegnoDesc: decoders.decodeControlloSegno(record.controlloSegno ?? ''),
    };
}


export const decodeLivello = decoders.decodeLivello;
export const decodeGruppo = decoders.decodeGruppo;
export const decodeControlloSegno = decoders.decodeControlloSegno; 