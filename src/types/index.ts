// Questo file conterrà tutte le definizioni di tipo (interfacce) per il nostro dominio di business.
// Manterrà il nostro codice organizzato, riutilizzabile e fortemente tipizzato.

/**
 * Rappresenta un Cliente.
 */
export interface Cliente {
  id: string;
  nome: string;
  externalId?: string | null;
}

/**
 * Rappresenta un Fornitore.
 */
export interface Fornitore {
  id: string;
  nome: string;
  externalId?: string | null;
}

/**
 * Rappresenta un centro di costo o di ricavo, una delle colonne analitiche del foglio Excel.
 * Esempio: "personale", "gestione automezzi", "sacchi".
 */
export interface VoceAnalitica {
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
  voceAnaliticaSuggeritaId?: string; // Es. '2' (gestione automezzi)
  richiedeVoceAnalitica?: boolean; // True se il conto richiede una voce analitica
  vociAnaliticheAbilitateIds?: string[]; // Lista di Voci Analitiche permesse per questo conto
  contropartiteSuggeriteIds?: string[]; // Lista di conti suggeriti come contropartita
}

/**
 * Rappresenta una Commessa di lavoro. Contiene i dati anagrafici
 * e la struttura di budget per il confronto con il consuntivo.
 */
export interface BudgetVoce {
  id: string;
  importo: number;
  commessaId: string;
  voceAnaliticaId: string;
  voceAnalitica: VoceAnalitica;
}

export interface Commessa {
  id: string;
  externalId?: string | null;
  nome: string;
  descrizione?: string | null;
  clienteId: string;
  cliente?: Cliente;
  budget?: Partial<BudgetVoce>[];
  allocazioni?: Allocazione[];
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
  externalId?: string | null; // ID esterno per importazione
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
  voceAnaliticaId: string;
  importo: number; // L'importo finale calcolato
  descrizione?: string;
}

/**
 * Rappresenta una singola riga di dettaglio all'interno di una ScritturaContabile.
 */
export interface RigaScrittura {
  id: string;
  descrizione: string;
  dare: number;
  avere: number;
  contoId: string;
  allocazioni: Allocazione[];
}

/**
 * Rappresenta una registrazione di Prima Nota completa.
 */
export interface ScritturaContabile {
  id: string; // UUID per la registrazione
  data: string; // Usiamo l'oggetto Date per maneggiarlo più facilmente, lo convertiremo in stringa solo per le API
  causaleId: string; // ID della causale usata (obbligatorio se si usa un automatismo)
  descrizione: string;
  righe: RigaScrittura[];
  datiAggiuntivi?: {
    fornitoreId?: string | null;
    clienteId?: string | null;
    totaleFattura?: number | string;
    aliquotaIva?: number;
  };
}

// --- Tipi per la Dashboard Commesse ---

/**
 * Rappresenta i dati per una singola card KPI nella dashboard.
 */
export interface CardKPI {
  label: string;
  value: string; // Valore formattato come stringa (es. "€ 1.2M", "33%")
  delta?: string; // Variazione percentuale opzionale (es. "+8.2%")
}

/**
 * Rappresenta una riga nella tabella della dashboard delle commesse.
 */
export interface CommessaRow {
  id: string;
  nome: string;
  codice: string; // Es. CDM-2024-001
  cliente: string;
  stato: 'In Lavorazione' | 'Aperta' | 'Chiusa' | 'Fatturata';
  ricavi: number;
  costi: number;
  marginePercentuale: number; // (ricavi - costi) / ricavi
}

/**
 * L'oggetto dati principale per popolare la nuova dashboard delle commesse.
 */
export interface DashboardCommesseData {
  kpi: {
    commesseAttive: CardKPI;
    ricaviTotali: CardKPI;
    costiTotali: CardKPI;
    margineLordoMedio: CardKPI;
  };
  commesse: CommessaRow[];
}

// --- TIPI PER LA DASHBOARD DI CONTROLLO ---

export interface CommessaDashboard {
  id: string;
  nome: string;
  cliente: {
    id: string;
    nome: string;
  };
  stato: string; // Es. "In Lavorazione", "Chiusa"
  ricavi: number;
  costi: number;
  margine: number; // (ricavi - costi) / ricavi
}

export interface DashboardData {
  commesse: CommessaDashboard[];
  kpi: {
    commesseAttive: number;
    ricaviTotali: number;
    costiTotali: number;
    margineLordoMedio: number;
  };
}

// --- TIPI PER LA GESTIONE DEI TEMPLATE DI IMPORTAZIONE ---

/**
 * Rappresenta la definizione di un singolo campo in un file a larghezza fissa.
 */
export interface FieldDefinition {
  id: string;
  nomeCampo: string;
  start: number;
  length: number;
  type: 'string' | 'number' | 'date';
  fileIdentifier?: string | null;
}

/**
 * Rappresenta un template di importazione completo.
 */
export interface ImportTemplate {
  id: string;
  nome: string;
  fields: FieldDefinition[];
}

export {}; 