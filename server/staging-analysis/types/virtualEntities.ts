// Tipi per entità virtuali - interpretazione diretta di dati staging
// ZERO persistenza - solo rappresentazione logica
// 
// AGGIORNAMENTO 2025-09-04: Integrazione completa con tracciati per relazioni
// e decodifiche basate su documentazione legacy (.docs/dati_cliente/tracciati/modificati/)

export interface VirtualAnagrafica {
  codiceFiscale: string;
  sigla: string;
  subcodice: string;
  tipo: 'CLIENTE' | 'FORNITORE' | 'INTERNO';
  matchedEntity: {
    id: string;
    nome: string;
  } | null;
  matchConfidence: number;
  sourceRows: number; // Quanti record staging lo referenziano
  
  // BUSINESS DATA FOR FRONTEND TABLE
  codiceCliente: string; // Priorità: subcodice > sigla > codiceFiscale (primo 10 char)
  denominazione: string; // Note se disponibili, altrimenti sigla o fallback
  totaleImporti: number; // Totale importi movimenti contabili
  transazioni: string[]; // Lista codici univoci scaricamento
  
  // NUOVI CAMPI RELAZIONALI (basati su A_CLIFOR.md)
  tipoContoDecodificato: string; // C=Cliente, F=Fornitore, E=Entrambi
  tipoSoggettoDecodificato?: string; // 0=Persona Fisica, 1=Soggetto Diverso  
  descrizioneCompleta: string; // Denominazione + tipo decodificato
  matchType: 'exact' | 'partial' | 'fallback' | 'none';
  sourceField: 'subcodice' | 'codiceFiscale' | 'sigla'; // Campo utilizzato per il match
}

export interface VirtualRigaContabile {
  progressivoRigo: string;
  conto: string;
  siglaConto?: string;
  importoDare: number;
  importoAvere: number;
  note: string;
  anagrafica: VirtualAnagrafica | null;
  hasCompetenzaData: boolean;
  hasMovimentiAnalitici: boolean;
  // NUOVI CAMPI INTERPRETATIVI
  tipoRiga: RigaType;
  voceAnaliticaSuggerita?: string;
  isAllocabile: boolean;
  motivoNonAllocabile?: string;
  classeContabile: string; // es. "6xxx" per costi, "7xxx" per ricavi
  
  // DENOMINAZIONI CONTI RISOLTE (via RelationalMapper)
  contoDenominazione?: string;
  contoDescrizione?: string;
  contoEnricchito?: ContoEnricchito; // Riferimento completo via RelationalMapper
  
  // DATI CONTIGEN ARRICCHITI (da stagingConto + decodifiche)
  contigenData?: {
    codifica: string;
    descrizione: string;
    tipo: string; // P=Patrimoniale, E=Economico, C=Cliente, F=Fornitore
    tipoDecodificato: string; // Decodifica leggibile del tipo
    sigla: string;
    gruppo?: string; // A=Attività, C=Costo, N=Patrimonio Netto, P=Passività, R=Ricavo
    gruppoDecodificato?: string; // Decodifica leggibile del gruppo
    livello?: string; // 1=Mastro, 2=Conto, 3=Sottoconto
    livelloDecodificato?: string; // Decodifica leggibile del livello
    descrizioneCompleta?: string; // Descrizione composita completa
  };
  
  // METADATI RELAZIONALI
  matchType?: 'exact' | 'sigla' | 'partial' | 'fallback' | 'none';
  matchConfidence?: number; // 0-100
  sourceField?: 'codice' | 'sigla' | 'externalId'; // Campo utilizzato per il match
  
  // ANAGRAFICA RISOLTE (da PNRIGCON pattern)
  anagraficaRisolta?: VirtualAnagraficaCompleta;
}

export interface VirtualRigaIva {
  codiceIva: string;
  contropartita: string;
  imponibile: number;
  imposta: number;
  importoLordo: number;
  note: string;
  matchedCodiceIva: {
    id: string;
    descrizione: string;
    aliquota: number;
  } | null;
  
  // NUOVO: Contropartita arricchita
  matchedContropartita?: {
    codice: string;
    descrizione: string;
  } | null;
  
  // CAMPI RELAZIONALI ESTESI (via RelationalMapper)
  codiceIvaEnricchito?: CodiceIvaEnricchito; // Riferimento completo via RelationalMapper
  codiceIvaDenominazione?: string; // Denominazione decodificata del codice IVA
  codiceIvaAliquota?: number; // Aliquota associata al codice
  
  // METADATI RELAZIONALI  
  matchType?: 'exact' | 'externalId' | 'none';
  matchConfidence?: number; // 0-100
}

export interface VirtualAllocazione {
  progressivoRigoContabile: string;
  centroDiCosto: string;
  parametro: string;
  matchedCommessa: {
    id: string;
    nome: string;
  } | null;
  matchedVoceAnalitica: {
    id: string;
    nome: string;
  } | null;
  
  // NUOVO: Centro di costo arricchito
  matchedCentroCosto?: {
    codice: string;
    descrizione: string;
  } | null;
}

export interface VirtualScrittura {
  codiceUnivocoScaricamento: string;
  dataRegistrazione: Date;
  causale: string;
  descrizione: string;
  numeroDocumento?: string;
  dataDocumento?: Date;
  righeContabili: VirtualRigaContabile[];
  righeIva: VirtualRigaIva[];
  allocazioni: VirtualAllocazione[];
  totaliDare: number;
  totaliAvere: number;
  isQuadrata: boolean;
  allocationStatus: AllocationStatus;
  // NUOVI CAMPI INTERPRETATIVI
  tipoMovimento: MovimentoType;
  causaleInterpretata: CausaleCategory;
  isAllocabile: boolean;
  motivoNonAllocabile?: string;
  righeAllocabili: number;
  suggerimentiAllocazione: AllocationSuggestion[];
  
  // CAMPI RELAZIONALI ESTESI (via RelationalMapper)
  causaleEnricchita?: CausaleEnricchita; // Riferimento completo via RelationalMapper
  causaleDescrizione?: string; // Descrizione decodificata della causale
  
  // ANAGRAFICHE AGGREGATE (risolte da tutte le righe)
  anagraficheRisolte: VirtualAnagraficaCompleta[]; // Tutte le anagrafiche coinvolte nella scrittura
  
  // METADATI RELAZIONALI AGGREGATI
  qualitaRelazioni: {
    contiRisolti: number; // Quanti conti hanno denominazione risolta
    anagraficheRisolte: number; // Quante anagrafiche sono state risolte
    codiciIvaRisolti: number; // Quanti codici IVA sono stati risolti
    percentualeCompletezza: number; // 0-100, qualità complessiva delle relazioni risolte
  };
}

export interface VirtualMovimento {
  scrittura: VirtualScrittura;
  anagraficheRisolte: VirtualAnagrafica[];
  totaleMovimento: number;
  tipoMovimento: 'COSTO' | 'RICAVO' | 'ALTRO';
  allocationPercentage: number;
  businessValidations: ValidationResult[];
}

export type AllocationStatus = 
  | 'non_allocato' 
  | 'parzialmente_allocato' 
  | 'completamente_allocato';

export interface ValidationResult {
  rule: string;
  passed: boolean;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

// Tipi per risposte API
export interface StagingAnalysisResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  processingTime: number;
}

export interface AnagraficheResolutionData {
  anagrafiche: VirtualAnagrafica[];
  totalRecords: number;
  matchedRecords: number;
  unmatchedRecords: number;
}

export interface RigheAggregationData {
  scritture: VirtualScrittura[];
  totalScrittureCount: number;
  quadrateScrittureCount: number;
  nonQuadrateScrittureCount: number;
  totalRigheCount: number;
  // NUOVI DATI AGGREGATI
  movimentiAggregati: MovimentiAggregati;
  totalRigheAllocabili: number;
  percentualeAllocabilita: number;
}

export interface AllocationStatusData {
  allocationsByStatus: Record<AllocationStatus, number>;
  totalAllocations: number;
  averageAllocationPercentage: number;
  topUnallocatedMovements: VirtualMovimento[];
}

export interface UserMovementsData {
  movimenti: VirtualMovimento[];
  totalMovimenti: number;
  costiTotal: number;
  ricaviTotal: number;
  altroTotal: number;
}

export interface AllocationWorkflowTest {
  rigaScritturaIdentifier: string;
  proposedAllocations: {
    commessaExternalId: string;
    voceAnaliticaNome: string;
    importo: number;
  }[];
}

export interface AllocationWorkflowResult {
  success: boolean;
  virtualAllocations: VirtualAllocazione[];
  validations: ValidationResult[];
  totalAllocatedAmount: number;
  remainingAmount: number;
}

export interface BusinessValidationTest {
  validationRules: string[];
  includeSeverityLevels: ('ERROR' | 'WARNING' | 'INFO')[];
}

export interface BusinessValidationData {
  validationResults: ValidationResult[];
  totalRulesApplied: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

// ===============================================================================
// NUOVI TIPI PER CLASSIFICAZIONE INTERPRETATIVA (basati su esempi-registrazioni.md)
// ===============================================================================

export type MovimentoType = 
  | 'FATTURA_ACQUISTO'      // FRS, FTRI, FTDR
  | 'FATTURA_VENDITA'       // FTEM, FTS, FTDE, FTE0
  | 'MOVIMENTO_FINANZIARIO' // PAGA, INC, 38
  | 'ASSESTAMENTO'          // RISA, RATP, RIMI, STIP
  | 'GIRO_CONTABILE'        // GIRO, 32, RILE
  | 'NOTA_CREDITO'          // NCRSP, NCEM
  | 'ALTRO';

export type CausaleCategory = 
  | 'COSTO_DIRETTO'           // Costi imputabili a commesse
  | 'COSTO_INDIRETTO'         // Costi generali da ripartire
  | 'RICAVO'                  // Ricavi da imputare
  | 'MOVIMENTO_PATRIMONIALE'  // Non ha impatto su commesse
  | 'MOVIMENTO_FINANZIARIO'   // Pagamenti/incassi
  | 'COMPETENZA_FUTURA'       // Risconti/ratei
  | 'ALTRO';

export type RigaType = 
  | 'COSTO_ALLOCABILE'        // Costo da imputare a commessa
  | 'RICAVO_ALLOCABILE'       // Ricavo da imputare a commessa  
  | 'COSTO_GENERALE'          // Costo generale (cancelleria, etc.)
  | 'ANAGRAFICA'              // Cliente/fornitore
  | 'IVA'                     // Conto IVA - mai allocabile
  | 'BANCA'                   // Conto finanziario
  | 'PATRIMONIALE'            // Altri conti patrimoniali
  | 'ALTRO';

export interface AllocationSuggestion {
  rigaProgressivo: string;
  voceAnalitica: string;
  descrizioneVoce: string;
  motivazione: string;
  confidenza: number; // 0-100
  importoSuggerito: number;
}

// ===============================================================================
// NUOVI TIPI PER RELAZIONI COMPLETE (basati su RelationalMapper)
// ===============================================================================

// Import dei tipi dal RelationalMapper
import type { 
  AnagraficaCompleta, 
  ContoEnricchito, 
  CausaleEnricchita, 
  CodiceIvaEnricchito 
} from '../utils/relationalMapper.js';

// Re-export per uso esterno
export type { 
  AnagraficaCompleta, 
  ContoEnricchito, 
  CausaleEnricchita, 
  CodiceIvaEnricchito 
};

// Alias per compatibilità con nomi esistenti
export type VirtualAnagraficaCompleta = AnagraficaCompleta;
export type VirtualContoEnricchito = ContoEnricchito;
export type VirtualCausaleEnricchita = CausaleEnricchita;
export type VirtualCodiceIvaEnricchito = CodiceIvaEnricchito;

// Interfaccia per scrittura completamente risolta (tutte le relazioni)
export interface VirtualScritturaCompleta extends VirtualScrittura {
  // Override dei campi con versioni enriched
  righeContabili: VirtualRigaContabileCompleta[];
  righeIva: VirtualRigaIvaCompleta[];
  
  // Metadati di qualità relazionale per l'intera scrittura
  qualitaRelazionaleComplessiva: {
    scoreComplessivo: number; // 0-100
    contiCompletamenteRisolti: number;
    anagraficheCompletamenteRisolte: number;  
    codiciIvaCompletamenteRisolti: number;
    areeProblematiche: string[]; // Lista delle aree con problemi di risoluzione
  };
}

// Riga contabile con tutte le relazioni risolte
export interface VirtualRigaContabileCompleta extends VirtualRigaContabile {
  contoEnricchito: ContoEnricchito; // Sempre presente (fallback se necessario)
  anagraficaRisolta?: AnagraficaCompleta; // Se applicabile per la riga
}

// Riga IVA con tutte le relazioni risolte
export interface VirtualRigaIvaCompleta extends VirtualRigaIva {
  codiceIvaEnricchito: CodiceIvaEnricchito; // Sempre presente (fallback se necessario)
}

// Aggregazione per tipologia movimenti (estensione RigheAggregationData)
export interface MovimentiAggregati {
  fattureAcquisto: {
    count: number;
    totaleImporto: number;
    allocabili: number;
  };
  fattureVendita: {
    count: number; 
    totaleImporto: number;
    allocabili: number;
  };
  movimentiFinanziari: {
    count: number;
    totaleImporto: number;
    allocabili: 0; // Mai allocabili
  };
  assestamenti: {
    count: number;
    totaleImporto: number;
    allocabili: number;
  };
  giroContabili: {
    count: number;
    totaleImporto: number; 
    allocabili: 0; // Mai allocabili
  };
}

// ===============================================================================
// NUOVI TIPI PER MOVIMENTI CONTABILI COMPLETI (Sezione G)
// ===============================================================================

export interface MovimentoContabileCompleto {
  testata: {
    codiceUnivocoScaricamento: string;
    dataRegistrazione: string; // YYYY-MM-DD format
    dataDocumento?: string;
    numeroDocumento: string;
    codiceCausale: string;
    descrizioneCausale: string;
    causaleDecodificata: string; // User-friendly description
    soggettoResolve: VirtualAnagrafica; // Primary subject of the movement
  };
  righeDettaglio: VirtualRigaContabile[];
  righeIva: VirtualRigaIva[];
  allocazioni?: VirtualAllocazione[];
  totaliDare: number;
  totaliAvere: number;
  statoDocumento: 'Draft' | 'Posted' | 'Validated';
  filtriApplicabili: string[]; // Tags for filtering UI
}

export interface MovimentiContabiliData {
  movimenti: MovimentoContabileCompleto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filtriApplicati: {
    dataDa?: string;
    dataA?: string;
    soggetto?: string;
    stato?: 'D' | 'P' | 'V' | 'ALL';
    page?: number;
    limit?: number;
  };
  statistiche: {
    totalMovimenti: number;
    totalImporto: number;
    movimentiQuadrati: number;
    movimentiAllocabili: number;
  };
}

// --- Allocation Workflow Types ---
export interface AllocationWorkflowFilters {
  // Base filters (compatibili con MovimentiContabiliFilters)
  dataDa?: string; // YYYY-MM-DD
  dataA?: string;  // YYYY-MM-DD
  soggetto?: string; // Ricerca parziale
  stato?: 'D' | 'P' | 'V' | 'ALL'; // Draft, Posted, Validated, All
  page?: number;
  limit?: number;
  
  // Allocation-specific filters
  soloAllocabili?: boolean;          // Solo movimenti con righe allocabili
  statoAllocazione?: AllocationStatus; // Filtra per stato allocazione
  hasAllocazioniStaging?: boolean;   // Ha allocazioni MOVANAC predefinite
  contoRilevante?: boolean;          // Solo conti isRilevantePerCommesse
}

export interface AllocationSuggestion {
  tipo: 'MOVANAC' | 'REGOLA_DETTANAL' | 'PATTERN_STORICO';
  commessaId: string;
  commessaNome: string;
  voceAnaliticaId: string;
  voceAnaliticaNome: string;
  importoSuggerito: number;
  percentualeSuggerita?: number;
  confidenza: number; // 0-100
  reasoning: string;
  applicabileAutomaticamente: boolean;
}

export interface MovimentoAllocabile extends MovimentoContabileCompleto {
  righeLavorabili: VirtualRigaContabile[];  // Solo righe con isAllocabile=true
  suggerimentiMOVANAC: VirtualAllocazione[];
  suggerimentiRegole: AllocationSuggestion[];
  simulazioneVirtuale?: AllocazioneVirtuale[];
  potenzialeBudgetImpact: BudgetImpact[];
}

export interface AllocazioneVirtuale {
  id: string; // Temporaneo per la UI
  rigaProgressivo: string;
  commessaId: string;
  commessaNome: string;
  voceAnaliticaId: string;
  voceAnaliticaNome: string;
  importo: number;
  percentuale?: number;
  isFromSuggestion: boolean;
  suggestionType?: 'MOVANAC' | 'REGOLA_DETTANAL' | 'PATTERN_STORICO';
  validazioni: ValidationResult[];
}

export interface BudgetImpact {
  commessaId: string;
  commessaNome: string;
  voceAnaliticaId: string;
  voceAnaliticaNome: string;
  budgetAttuale: number;
  impactImporto: number;
  nuovoPercentualeUtilizzo: number;
  isOverBudget: boolean;
}

export interface AllocationWorkflowTestRequest {
  movimentoId: string; // codiceUnivocoScaricamento
  allocazioniVirtuali: AllocazioneVirtuale[];
  modalitaTest: 'VALIDATION_ONLY' | 'PREVIEW_SCRITTURE' | 'IMPACT_ANALYSIS';
}

export interface AllocationWorkflowTestResponse {
  success: boolean;
  risultatiValidazione: ValidationResult[];
  allocazioniProcessate: AllocazioneVirtuale[];
  totalAllocatedAmount: number;
  remainingAmount: number;
  budgetImpacts: BudgetImpact[];
  previewScritture?: ScritturaContabilePreview[];
  riepilogoOperazioni: OperationSummary;
}

export interface ScritturaContabilePreview {
  descrizione: string;
  dataMovimento: string;
  righe: Array<{
    contoId: string;
    contoCodice: string;
    contoDenominazione: string;
    dare?: number;
    avere?: number;
    commessaId?: string;
    voceAnaliticaId?: string;
  }>;
  totaliDare: number;
  totaliAvere: number;
  isQuadrata: boolean;
}

export interface OperationSummary {
  totalMovimentiProcessati: number;
  totalAllocazioniCreate: number;
  totalImportoAllocato: number;
  commesseInteressate: string[];
  vociAnaliticheUtilizzate: string[];
  tempoElaborazioneStimato: number; // minuti
}

export interface AllocationWorkflowResponse {
  movimentiAllocabili: MovimentoAllocabile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filtriApplicati: AllocationWorkflowFilters;
  statistiche: {
    totalMovimenti: number;
    movimentiConSuggerimenti: number;
    allocazioniMOVANACDisponibili: number;
    regoleDETTANALApplicabili: number;
    potenzialeTempoRisparmiato: number; // minuti
  };
  commesseDisponibili: Array<{
    id: string;
    nome: string;
    clienteNome: string;
    isAttiva: boolean;
    budgetTotale?: number;
  }>;
  vociAnalitiche: Array<{
    id: string;
    nome: string;
    tipo: string;
    isAttiva: boolean;
  }>;
}

export interface ValidationResult {
  rule: string;
  passed: boolean;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}