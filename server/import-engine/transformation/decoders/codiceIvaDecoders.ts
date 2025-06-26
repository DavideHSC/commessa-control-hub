export function decodeTipoCalcolo(code: string | undefined | null): string {
    if (!code) return 'Non specificato';
    const mapping: Record<string, string> = {
        'N': 'Nessuno',
        'O': 'Normale',
        'A': 'Solo imposta',
        'I': 'Imposta non assolta',
        'S': 'Scorporo',
        'T': 'Scorporo per intrattenimento',
        'E': 'Esente/Non imponibile/Escluso',
        'V': 'Ventilazione corrispettivi',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodePlafondAcquisti(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        'I': 'Interno/Intra',
        'E': 'Importazioni',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodePlafondVendite(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        'E': 'Esportazioni',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeGestioneProRata(code: string | undefined | null): string {
    if (!code) return 'Non specificato';
    const mapping: Record<string, string> = {
        'D': "Volume d'affari",
        'E': 'Esente',
        'N': 'Escluso',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeComunicazioneVendite(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        '1': 'Op.Attive CD1.1',
        '2': 'Op.Attive (di cui intra) CD1.4',
        '3': 'Op.Attive (di cui non impon.) CD1.2',
        '4': 'Op.Attive (di cui esenti) CD1.3',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeComunicazioneAcquisti(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        '1': 'Op.Passive CD2.1',
        '2': 'Op.Passive (di cui intra) CD2.4',
        '3': 'Importazioni oro/argento CD3.1 CD3.2',
        '4': 'Op.Passive (di cui non impon.) CD2.2',
        '5': 'Op.Passive (di cui esenti) CD2.3',
        '6': 'Importazioni rottami CD3.3 CD3.4',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeAcquistiCessioni(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        'A': 'Tabella A1',
        'B': 'Beni Attività connesse',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeIndicatoreTerritorialeVendite(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        'VC': 'Vendita CEE',
        'VX': 'Vendita Extra CEE',
        'VM': 'Vendita Mista CEE/Extra CEE',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeIndicatoreTerritorialeAcquisti(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        'AC': 'Acquisto CEE',
        'AX': 'Acquisto Extra CEE',
        'MC': 'Acquisto misto parte CEE',
        'MX': 'Acquisto misto parte Extra CEE',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeMetodoApplicare(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        'T': 'Analitico/Globale',
        'F': 'Forfetario',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodePercentualeForfetaria(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        '25': '25%',
        '50': '50%',
        '60': '60%',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeQuotaForfetaria(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        '1': "1/10 dell'imposta",
        '2': "1/2 dell'imposta",
        '3': "1/3 dell'imposta",
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
}

export function decodeImpostaIntrattenimenti(code: string | undefined | null): string {
    if (!code) return 'Non applicabile';
    const mapping: Record<string, string> = {
        '6': '6%',
        '8': '8%',
        '10': '10%',
        '16': '16%',
        '60': '60%',
    };
    return mapping[code.trim()] ?? `Codice sconosciuto: ${code}`;
} 