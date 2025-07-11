// Tipi per il processo di riconciliazione
export interface ReconciliationSummaryData {
  totalScrittureToProcess: number;
  totalRigheToProcess: number;
  reconciledAutomatically: number;
  needsManualReconciliation: number;
}

// Definisce la struttura dati esatta che la UI di riconciliazione si aspetta.
export type RigaDaRiconciliare = {
  id: string; // L'ID della riga di staging originale
  externalId: string; // L'ID della scrittura a cui appartiene
  data: Date;
  descrizione: string;
  importo: number;
  conto: {
      id: string;
      codice: string | null;
      nome: string;
  };
  voceAnaliticaSuggerita: {
      id: string;
      nome: string;
  } | null;
};

export interface ReconciliationResult {
  message: string;
  summary: ReconciliationSummaryData;
  righeDaRiconciliare: RigaDaRiconciliare[];
  errors: string[];
} 