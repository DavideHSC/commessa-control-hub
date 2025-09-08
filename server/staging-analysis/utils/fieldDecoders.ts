/**
 * Field Decoders per valori abbreviati dai tracciati legacy
 * 
 * Queste funzioni decodificano i valori abbreviati presenti nei dati staging
 * basandosi sulla documentazione ufficiale dei tracciati in:
 * .docs/dati_cliente/tracciati/modificati/
 * 
 * @author Claude Code
 * @date 2025-09-04
 */

// === A_CLIFOR.TXT - Tracciato Anagrafica Clienti/Fornitori ===

/**
 * Decodifica TIPO CONTO (pos. 50)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeTipoConto(value: string): string {
  // Se il valore è vuoto, non deve apparire nulla, per evitare "Stipendi / -"
  if (!value || value.trim() === '') return ''; 
  
  switch (value.trim().toUpperCase()) {
    case 'C': return 'Cliente';
    case 'F': return 'Fornitore';
    case 'E': return 'Entrambi';
    // Per i movimenti interni, non vogliamo nessuna scritta sotto la denominazione
    case 'INTERNO': return ''; 
    default: return value; 
  }
}

/**
 * Decodifica TIPO SOGGETTO (pos. 94)
 * @param value - Valore numerico da decodificare
 * @returns Descrizione decodificata
 */
export function decodeTipoSoggetto(value: string | number): string {
  const numValue = typeof value === 'string' ? value.trim() : value.toString();
  
  switch (numValue) {
    case '0': return 'Persona Fisica';
    case '1': return 'Soggetto Diverso';
    default: return `Tipo ${numValue}`; // Fallback
  }
}

/**
 * Decodifica SESSO (pos. 195)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeSesso(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'M': return 'Maschio';
    case 'F': return 'Femmina';
    default: return value;
  }
}

// === CAUSALI.TXT - Tracciato Causali Contabili ===

/**
 * Decodifica TIPO MOVIMENTO (pos. 51)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeTipoMovimento(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'C': return 'Contabile';
    case 'I': return 'Contabile/Iva';
    default: return value;
  }
}

/**
 * Decodifica TIPO AGGIORNAMENTO (pos. 52)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeTipoAggiornamento(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'I': return 'Saldo Iniziale';
    case 'P': return 'Saldo Progressivo';
    case 'F': return 'Saldo Finale';
    default: return value;
  }
}

/**
 * Decodifica TIPO REGISTRO IVA (pos. 69)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeTipoRegistroIva(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'A': return 'Acquisti';
    case 'C': return 'Corrispettivi';
    case 'V': return 'Vendite';
    default: return value;
  }
}

/**
 * Decodifica SEGNO MOVIMENTO IVA (pos. 70)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeSegnoMovimentoIva(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'I': return 'Incrementa (+)';
    case 'D': return 'Decrementa (-)';
    default: return value;
  }
}

// === CONTIGEN.TXT - Tracciato Piano dei Conti Generale ===

/**
 * Decodifica LIVELLO (pos. 5)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeLivelloContigen(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim()) {
    case '1': return 'Mastro';
    case '2': return 'Conto';
    case '3': return 'Sottoconto';
    default: return `Livello ${value}`;
  }
}

/**
 * Decodifica TIPO CONTO CONTIGEN (pos. 76)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeTipoContigen(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'P': return 'Patrimoniale';
    case 'E': return 'Economico';
    case 'O': return 'Conto d\'ordine';
    case 'C': return 'Cliente';
    case 'F': return 'Fornitore';
    default: return value;
  }
}

/**
 * Decodifica CONTROLLO SEGNO (pos. 89)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeControlloSegno(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'A': return 'Avere';
    case 'D': return 'Dare';
    default: return value;
  }
}

/**
 * Decodifica GRUPPO CONTO (pos. 257)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeGruppoContigen(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'A': return 'Attività';
    case 'C': return 'Costo';
    case 'N': return 'Patrimonio Netto';
    case 'P': return 'Passività';
    case 'R': return 'Ricavo';
    case 'V': return 'Rettifiche di Costo';
    case 'Z': return 'Rettifiche di Ricavo';
    default: return value;
  }
}

/**
 * Decodifica GESTIONE BENI AMMORTIZZABILI (pos. 194)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeGestioneBeniAmmortizzabili(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'M': return 'Immobilizzazioni Materiali';
    case 'I': return 'Immobilizzazioni Immateriali';
    case 'S': return 'Fondo Svalutazione';
    default: return value;
  }
}

/**
 * Decodifica DETTAGLIO CLI./FOR. PRIMA NOTA (pos. 268)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeDettaglioCliFornitorePrimaNota(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim()) {
    case '1': return 'Cliente';
    case '2': return 'Fornitore';
    case '3': return 'Cliente/Fornitore';
    default: return value;
  }
}

// === PNRIGCON.TXT - Tracciato Prima Nota Righe Contabili ===

/**
 * Decodifica TIPO CONTO RIGHE CONTABILI (pos. 19)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeTipoContoRigheContabili(value: string): string {
  if (!value || value.trim() === '') return 'Sottoconto';
  
  switch (value.trim().toUpperCase()) {
    case 'C': return 'Cliente';
    case 'F': return 'Fornitore';
    default: return value;
  }
}

/**
 * Decodifica STATO MOVIMENTO STUDI (pos. 266)
 * @param value - Valore da decodificare
 * @returns Descrizione decodificata
 */
export function decodeStatoMovimentoStudi(value: string): string {
  if (!value || value.trim() === '') return 'N/D';
  
  switch (value.trim().toUpperCase()) {
    case 'G': return 'Generato';
    case 'M': return 'Manuale';
    default: return value;
  }
}

// === Utility Functions ===

/**
 * Decodifica generica per valori booleani "X"
 * @param value - Valore da decodificare
 * @returns true se "X", false altrimenti
 */
export function decodeBooleanoX(value: string): boolean {
  return value && value.trim().toUpperCase() === 'X';
}

/**
 * Decodifica generica per valori booleani "X" con descrizione
 * @param value - Valore da decodificare
 * @returns Descrizione Si/No
 */
export function decodeBooleanoXDescrizione(value: string): string {
  return decodeBooleanoX(value) ? 'Sì' : 'No';
}

/**
 * Funzione utility per fallback su valore originale
 * @param value - Valore originale
 * @param decoder - Funzione di decodifica
 * @returns Valore decodificato o originale se decodifica fallisce
 */
export function safeDecoder<T>(value: T, decoder: (val: T) => string): string {
  try {
    const decoded = decoder(value);
    return decoded && decoded !== 'N/D' ? decoded : String(value);
  } catch (error) {
    console.warn(`Decoder fallback for value: ${value}`, error);
    return String(value);
  }
}

// === Composite Decoders ===

/**
 * Decodifica completa per anagrafica (tipo + sottotipo)
 * @param tipoConto - Tipo conto
 * @param tipoSoggetto - Tipo soggetto
 * @returns Descrizione completa
 */
export function decodeAnagraficaCompleta(tipoConto: string, tipoSoggetto: string | number): string {
  const tipo = decodeTipoConto(tipoConto);
  const sottotipo = decodeTipoSoggetto(tipoSoggetto);
  
  if (tipo === 'N/D' && sottotipo === 'N/D') return 'N/D';
  if (tipo === 'N/D') return sottotipo;
  if (sottotipo === 'N/D') return tipo;
  
  return `${tipo} (${sottotipo})`;
}

/**
 * Decodifica completa per conto CONTIGEN (livello + tipo + gruppo)
 * @param livello - Livello conto
 * @param tipo - Tipo conto
 * @param gruppo - Gruppo conto
 * @returns Descrizione completa
 */
export function decodeContoContigenCompleto(livello: string, tipo: string, gruppo?: string): string {
  const livelloDesc = decodeLivelloContigen(livello);
  const tipoDesc = decodeTipoContigen(tipo);
  const gruppoDesc = gruppo ? decodeGruppoContigen(gruppo) : null;
  
  let result = `${livelloDesc} - ${tipoDesc}`;
  if (gruppoDesc && gruppoDesc !== 'N/D') {
    result += ` (${gruppoDesc})`;
  }
  
  return result;
}