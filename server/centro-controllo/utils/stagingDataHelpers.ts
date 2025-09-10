// Utility functions per interpretazione dati staging
// Funzioni pure - zero side effects

/**
 * Converte stringa importo italiana (con virgola) in numero
 * @deprecated Use parseGestionaleCurrency for Contabilità Evolution files
 */
export function parseItalianCurrency(value: string): number {
  if (!value || value.trim() === '') return 0;
  
  // Gestisce formati: "1.234,56", "1234,56", "1234.56", "1234"
  const cleanValue = value
    .replace(/\./g, '') // Rimuove punti (separatori migliaia)
    .replace(',', '.'); // Sostituisce virgola con punto
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Converte stringa importo da formato gestionale (Contabilità Evolution) in numero
 * Il gestionale usa formato americano: punto come separatore decimale
 * Esempi: "36.60" = 36.60€, "1300" = 1300.00€
 */
export function parseGestionaleCurrency(value: string): number {
  if (!value || value.trim() === '') return 0;
  const parsed = parseFloat(value.trim()); // Punto già corretto per gestionale
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Converte data da formato GGMMAAAA a Date object
 */
export function parseDateGGMMAAAA(dateStr: string): Date | null {
  if (!dateStr || dateStr.length !== 8) return null;
  
  const day = dateStr.substring(0, 2);
  const month = dateStr.substring(2, 4);
  const year = dateStr.substring(4, 8);
  
  const date = new Date(`${year}-${month}-${day}`);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Determina il tipo di anagrafica basandosi sul tipoConto
 */
export function getTipoAnagrafica(tipoConto: string): 'CLIENTE' | 'FORNITORE' | null {
  const tipo = tipoConto?.trim().toUpperCase();
  if (tipo === 'C') return 'CLIENTE';
  if (tipo === 'F') return 'FORNITORE';
  return null;
}

/**
 * Calcola la confidence per il matching di anagrafiche
 * Basata su somiglianza di codice fiscale, sigla, subcodice
 */
export function calculateMatchConfidence(
  stagingRecord: {
    clienteFornitoreCodiceFiscale: string;
    clienteFornitoreSigla: string;
    clienteFornitoreSubcodice: string;
  },
  dbEntity: {
    codiceFiscale?: string;
    nomeAnagrafico?: string;
    nome?: string;
  }
): number {
  let confidence = 0;
  
  // Match esatto codice fiscale = 100% confidence
  if (stagingRecord.clienteFornitoreCodiceFiscale === dbEntity.codiceFiscale) {
    return 1.0;
  }
  
  // Match parziale su nome/nome anagrafico
  const dbName = (dbEntity.nomeAnagrafico || dbEntity.nome || '').toLowerCase();
  const stagingSigla = stagingRecord.clienteFornitoreSigla.toLowerCase();
  
  if (dbName.includes(stagingSigla) || stagingSigla.includes(dbName)) {
    confidence += 0.7;
  }
  
  // Penalità per codici fiscali diversi
  if (stagingRecord.clienteFornitoreCodiceFiscale !== dbEntity.codiceFiscale) {
    confidence -= 0.3;
  }
  
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Determina se una scrittura è quadrata (dare = avere)
 */
export function isScrittuराQuadrata(
  righeContabili: Array<{ importoDare: number; importoAvere: number }>
): boolean {
  const totaleDare = righeContabili.reduce((sum, r) => sum + r.importoDare, 0);
  const totaleAvere = righeContabili.reduce((sum, r) => sum + r.importoAvere, 0);
  
  // Tolleranza di 0.01 per errori di arrotondamento
  return Math.abs(totaleDare - totaleAvere) < 0.01;
}

/**
 * Calcola lo stato di allocazione per una riga contabile
 */
export function calculateAllocationStatus(
  importoRiga: number,
  allocazioniImporto: number[]
): 'non_allocato' | 'parzialmente_allocato' | 'completamente_allocato' {
  const totaleAllocato = allocazioniImporto.reduce((sum, imp) => sum + imp, 0);
  
  if (totaleAllocato === 0) return 'non_allocato';
  if (Math.abs(totaleAllocato - Math.abs(importoRiga)) < 0.01) return 'completamente_allocato';
  return 'parzialmente_allocato';
}

/**
 * Determina il tipo di movimento basandosi sugli importi delle righe
 */
export function getTipoMovimento(
  righeContabili: Array<{ importoDare: number; importoAvere: number; conto: string }>
): 'COSTO' | 'RICAVO' | 'ALTRO' {
  const totaleDare = righeContabili.reduce((sum, r) => sum + r.importoDare, 0);
  const totaleAvere = righeContabili.reduce((sum, r) => sum + r.importoAvere, 0);
  
  // Logica semplificata - può essere raffinata basandosi sui piani dei conti
  if (totaleDare > totaleAvere) return 'COSTO';
  if (totaleAvere > totaleDare) return 'RICAVO';
  return 'ALTRO';
}

/**
 * Genera un identificatore univoco per una riga basandosi sui campi chiave
 */
export function generateRigaIdentifier(
  codiceUnivocoScaricamento: string,
  progressivoRigo: string
): string {
  return `${codiceUnivocoScaricamento}-${progressivoRigo}`;
}

/**
 * Valida che i campi obbligatori siano presenti per l'allocazione
 */
export function isValidAllocationData(allocation: {
  codiceUnivocoScaricamento?: string | null;
  progressivoRigoContabile?: string | null;
  centroDiCosto?: string | null;
  parametro?: string | null;
}): boolean {
  return !!(
    allocation.codiceUnivocoScaricamento?.trim() &&
    allocation.progressivoRigoContabile?.trim() &&
    allocation.centroDiCosto?.trim() &&
    allocation.parametro?.trim()
  );
}

/**
 * Crea un hash semplice per identificare record duplicati
 */
export function createRecordHash(fields: (string | number | null | undefined)[]): string {
  return fields
    .map(f => f?.toString() || '')
    .join('|')
    .toLowerCase();
}

/**
 * Formatta un numero come valuta italiana
 */
export function formatItalianCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Formatta una percentuale
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}