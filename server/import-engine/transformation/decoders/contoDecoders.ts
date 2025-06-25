import { TipoConto } from '@prisma/client';

/**
 * Determina il tipo di conto secondo la logica del gestionale legacy.
 * Questa funzione è il cuore della classificazione Conto/Costo/Ricavo.
 * FONTE DI VERITÀ: .docs/code/parser_contigen.py
 */
export function determineTipoConto(tipoChar?: string, codice?: string): TipoConto {
    const tipo = tipoChar?.trim().toUpperCase();
    switch (tipo) {
        case 'P': return TipoConto.Patrimoniale;
        case 'E':
            // Per tipo 'E' (Economico), si distingue tra Costo e Ricavo dal codice.
            // Questa logica deve essere validata rispetto alle regole del vecchio gestionale.
            if (codice?.startsWith('1') || codice?.startsWith('5')) {
                return TipoConto.Ricavo;
            }
            return TipoConto.Costo;
        case 'C': return TipoConto.Cliente;
        case 'F': return TipoConto.Fornitore;
        case 'O': return TipoConto.Patrimoniale; // Conto d'ordine -> mappato a Patrimoniale
        default: return TipoConto.Patrimoniale; // Default conservativo
    }
};

/**
 * Decodifica il livello gerarchico del conto.
 * FONTE DI VERITÀ: .docs/code/parser_contigen.py -> decode_livello
 */
export function decodeLivello(livello?: string): string | undefined {
  const mapping: Record<string, string> = {
    '1': 'Mastro',
    '2': 'Conto',
    '3': 'Sottoconto'
  };
  return livello ? mapping[livello.trim()] || undefined : undefined;
}

/**
 * Decodifica il gruppo di bilancio del conto.
 * FONTE DI VERITÀ: .docs/code/parser_contigen.py -> decode_gruppo
 */
export function decodeGruppo(gruppo?: string): string | undefined {
  const mapping: Record<string, string> = {
    'A': 'Attivo',
    'P': 'Passivo',
    'C': 'Costi',
    'R': 'Ricavi',
    'O': 'Ordine'
  };
  return gruppo ? mapping[gruppo.trim()] || undefined : undefined;
}

/**
 * Decodifica il controllo sul segno del movimento (Dare/Avere).
 * FONTE DI VERITÀ: .docs/code/parser_contigen.py -> decode_controllo_segno
 */
export function decodeControlloSegno(segno?: string): string | undefined {
  const mapping: Record<string, string> = {
    'D': 'Solo Dare',
    'A': 'Solo Avere',
    'T': 'Dare e Avere',
    'N': 'Nessun Controllo'
  };
  return segno ? mapping[segno.trim()] || undefined : undefined;
}

/**
 * Formatta la codifica gerarchica del conto.
 * La logica originale sembrava dipendere dal livello, ma il tracciato
 * suggerisce che il codice è già completo. Da validare.
 * FONTE DI VERITÀ: .docs/code/parser_contigen.py -> format_codifica_gerarchica
 */
export function formatCodificaGerarchica(codifica?: string, livello?: string): string | undefined {
    if (!codifica) return undefined;
    
    const cleanCode = codifica.trim();
    // La logica di slicing basata sul livello sembra ridondante se il codice è già univoco.
    // Per ora, restituiamo il codice pulito. Questo semplifica la logica.
    // Esempio:
    // Livello 1 (Mastro): 01
    // Livello 2 (Conto):   0101
    // Livello 3 (Sottoconto): 0101001
    // if (livello === '1') {
    //     return cleanCode.slice(0, 2) || cleanCode;
    // } else if (livello === '2') {
    //     return cleanCode.slice(0, 4) || cleanCode;
    // }
    return cleanCode;
} 