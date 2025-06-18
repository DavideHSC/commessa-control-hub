// Questo file conterrà tutte le definizioni di tipo (interfacce) per il nostro dominio di business.
// Manterrà il nostro codice organizzato, riutilizzabile e fortemente tipizzato.

/**
 * Rappresenta un centro di costo o di ricavo, una delle colonne analitiche del foglio Excel.
 * Esempio: "personale", "gestione automezzi", "sacchi".
 */
export interface CentroDiCosto {
  id: string; // Es. '1', '2', '3' come da file Excel
  nome: string; // Es. 'personale', 'gestione automezzi'
  descrizione?: string;
}

/**
 * Rappresenta una voce del Piano dei Conti.
 * Esempio: "6005000850 CARBURANTI E LUBRIFICANTI"
 */
export interface Conto {
  id: string; // Corrisponde al codice conto, es. "6005000850"
  codice: string; // Duplicato dell'id per chiarezza semantica
  nome: string; // Es. "CARBURANTI E LUBRIFICANTI"
  tipo: 'Costo' | 'Ricavo' | 'Patrimoniale' | 'Fornitore' | 'Cliente'; // Ampliato per maggiore specificità
  // Il motore del nostro automatismo: collega un conto a un centro di costo di default.
  centroDiCostoSuggeritoId?: string; // Es. '2' (gestione automezzi)
  richiedeCentroDiCosto?: boolean; // True se il conto richiede un centro di costo
  centriDiCostoAbilitatiIds?: string[]; // Lista di CdC permessi per questo conto
  contropartiteSuggeriteIds?: string[]; // Lista di conti suggeriti come contropartita
}

/**
 * Rappresenta una Commessa di lavoro. Contiene i dati anagrafici
 * e la struttura di budget per il confronto con il consuntivo.
 */
export interface Commessa {
  id: string; // Es. 'SORRENTO'
  nome: string; // Es. 'Comune di Sorrento'
  clienteId?: string; // ID del cliente associato alla commessa (per automatismi sui ricavi)
  descrizione?: string;
  /**
   * Il budget della commessa, suddiviso per ID del centro di costo.
   * La chiave è l'ID del CentroDiCosto, il valore è l'importo previsto.
   * Esempio: { '1': 2274867, '2': 358625 }
   */
  budget: {
    [centroDiCostoId: string]: number;
  };
}

/**
 * Campo dati richiesto da una causale per poter generare la scrittura.
 */
export interface CampoDatiPrimari {
  id: 'totaleDocumento' | 'aliquotaIva' | 'fornitoreId' | 'clienteId' | string; // ID univoco del campo
  label: string; // Es. "Totale Documento"
  tipo: 'number' | 'select' | 'text' | 'date';
  riferimentoConto?: 'Fornitore' | 'Cliente'; // Usato se tipo è 'select'
}

/**
 * Definisce il template per una registrazione contabile automatica.
 * È il motore degli automatismi di inserimento.
 */
export interface CausaleContabile {
  id: string; // Es. 'FATT_ACQ_MERCI'
  nome: string; // Nome breve, es. "Fattura Acquisto"
  descrizione: string; // Es. 'Registrazione Fattura Acquisto Merce'
  // Lista dei dati che l'utente deve inserire per usare il template
  datiPrimari: CampoDatiPrimari[]; 
  // Il template vero e proprio per generare le righe
  templateScrittura: VoceTemplateScrittura[];
}

/**
 * Rappresenta una riga del template di una causale contabile.
 */
export interface VoceTemplateScrittura {
  sezione: 'Dare' | 'Avere';
  // ID del conto da usare. Può essere un conto generico (es. 'IVA')
  // o un segnaposto che verrà sostituito da un dato primario (es. fornitoreId).
  contoId: string;
  // Specifica come calcolare l'importo per questa riga.
  formulaImporto: 'imponibile' | 'iva' | 'totale';
}

/**
 * Rappresenta la ripartizione di un importo su una specifica commessa e centro di costo.
 * Questa è l'informazione analitica finale.
 */
export interface Allocazione {
  id: string; // UUID per la riga di allocazione
  commessaId: string;
  centroDiCostoId: string;
  importo: number; // L'importo finale calcolato
  descrizione?: string;
}

/**
 * Rappresenta una singola riga di dettaglio all'interno di una ScritturaContabile.
 */
export interface RigaScrittura {
  id: string; // UUID per la riga
  contoId: string; // ID del conto movimentato (dal PianoDeiConti)
  descrizione: string;
  dare: number; // Importo in Dare
  avere: number; // Importo in Avere
  // Per le righe di costo/ricavo, questa è la lista delle allocazioni analitiche.
  // Una singola riga di costo può essere allocata a più commesse/centri di costo.
  allocazioni: Allocazione[];
}

/**
 * Rappresenta una registrazione di Prima Nota completa.
 */
export interface ScritturaContabile {
  id: string; // UUID per la registrazione
  data: Date; // Usiamo l'oggetto Date per maneggiarlo più facilmente, lo convertiremo in stringa solo per le API
  causaleId: string; // ID della causale usata (obbligatorio se si usa un automatismo)
  descrizione: string;
  righe: RigaScrittura[];
}

export {}; 