import type { ITestata, IRigaContabile, IRigaIva, IMovimentoAnalitico, IMovimentoCompleto } from '../types';

function safeParseFloat(str: string): number {
    if (!str || !str.trim()) return 0;
    return parseFloat(str.trim().replace(',', '.')) || 0;
}

function safeParseInt(str: string): number {
    if (!str || !str.trim()) return 0;
    return parseInt(str.trim(), 10) || 0;
}

// Helper to use 1-based indexing from the documentation
function slice(line: string, start: number, end: number): string {
    return line.substring(start - 1, end).trim();
}

export function parseDatiContabili(
    pntestaData: string,
    pnrigconData: string,
    pnrigivaData: string,
    movanacData: string
): IMovimentoCompleto[] {
    const movimenti = new Map<string, IMovimentoCompleto>();

    // 1. Parsing Testate (PNTESTA.TXT)
    pntestaData.split('\n').forEach(line => {
        if (line.trim().length === 0) return;
        const codiceUnivoco = slice(line, 21, 32);
        if (codiceUnivoco) {
            const testata: ITestata = {
                codiceFiscaleAzienda: slice(line, 4, 19),
                codiceUnivoco: codiceUnivoco,
                codiceCausale: slice(line, 40, 45),
                dataRegistrazione: slice(line, 86, 93),
                protocollo: slice(line, 158, 163),
                codiceFiscaleCliFor: slice(line, 100, 115),
                siglaCliFor: slice(line, 117, 128),
                totaleDocumento: safeParseFloat(slice(line, 173, 184)),
                noteMovimento: slice(line, 193, 252),
            };
            movimenti.set(codiceUnivoco, {
                testata: testata,
                righeContabili: [],
                righeIva: [],
            });
        }
    });
    
    // 2. Parsing Righe Contabili (PNRIGCON.TXT)
    pnrigconData.split('\n').forEach(line => {
        if (line.trim().length === 0) return;
        const codiceUnivoco = slice(line, 4, 15);
        const movimento = movimenti.get(codiceUnivoco);
        if (movimento) {
            const riga: IRigaContabile = {
                codiceUnivoco: codiceUnivoco,
                progressivoRigo: safeParseInt(slice(line, 16, 18)),
                tipoConto: slice(line, 19, 19),
                codiceFiscaleCliFor: slice(line, 20, 35),
                siglaCliFor: slice(line, 37, 48),
                conto: slice(line, 49, 58),
                importoDare: safeParseFloat(slice(line, 59, 70)),
                importoAvere: safeParseFloat(slice(line, 71, 82)),
                note: slice(line, 83, 142),
                movimentiAnalitici: [],
            };
            movimento.righeContabili.push(riga);
        }
    });

    // 3. Parsing Righe IVA (PNRIGIVA.TXT)
    pnrigivaData.split('\n').forEach(line => {
        if (line.trim().length === 0) return;
        const codiceUnivoco = slice(line, 4, 15);
        const movimento = movimenti.get(codiceUnivoco);
        if (movimento) {
            const riga: IRigaIva = {
                codiceUnivoco: codiceUnivoco,
                codiceIva: slice(line, 16, 19),
                contropartita: slice(line, 20, 29),
                imponibile: safeParseFloat(slice(line, 30, 41)),
                imposta: safeParseFloat(slice(line, 42, 53)),
                note: slice(line, 102, 161),
            };
            movimento.righeIva.push(riga);
        }
    });

    // 4. Parsing Movimenti Analitici (MOVANAC.TXT)
    movanacData.split('\n').forEach(line => {
        if (line.trim().length === 0) return;
        const codiceUnivoco = slice(line, 4, 15);
        const progressivoRigo = safeParseInt(slice(line, 16, 18));
        const movimento = movimenti.get(codiceUnivoco);

        if (movimento) {
            const rigaContabile = movimento.righeContabili.find(r => r.progressivoRigo === progressivoRigo && r.codiceUnivoco === codiceUnivoco);
            if (rigaContabile) {
                const analitico: IMovimentoAnalitico = {
                    codiceUnivoco: codiceUnivoco,
                    progressivoRigo: progressivoRigo,
                    centroDiCosto: slice(line, 19, 22),
                    parametro: safeParseFloat(slice(line, 23, 34)),
                };
                rigaContabile.movimentiAnalitici.push(analitico);
            }
        }
    });

    return Array.from(movimenti.values());
}
