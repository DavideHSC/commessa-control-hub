// Tipi TypeScript per il sistema Staging Analysis
// Separati dai tipi backend per permettere evoluzione indipendente

export interface StagingAnalysisApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  processingTime?: number;
  error?: string;
}

// --- Sezione A: Risoluzione Anagrafica ---
export interface AnagraficaResoluzione {
  codiceFiscale: string;
  sigla: string;
  subcodice: string;
  tipo: 'CLIENTE' | 'FORNITORE' | 'INTERNO' | string; // Aggiunto INTERNO e string per flessibilità
  matchedEntity: {
    id: string;
    nome: string;
  } | null;
  matchConfidence: number;
  sourceRows: number;
  denominazione?: string; // <-- CAMPO FONDAMENTALE AGGIUNTO
  isUnresolved?: boolean; // Campo opzionale per gestire soggetti non trovati
  sottocontoCliente?: string;    // Sottoconto clienti per logica sottoconto intelligente
  sottocontoFornitore?: string;  // Sottoconto fornitori per logica sottoconto intelligente
}

export interface AnagraficheResolutionResponse {
  anagrafiche: AnagraficaResoluzione[];
  totalRecords: number;
  matchedRecords: number;
  unmatchedRecords: number;
}

// --- Sezione B: Aggregazione Righe ---
export interface VirtualRigaContabile {
  progressivoRigo: string;
  conto: string;
  siglaConto?: string;
  importoDare: number;
  importoAvere: number;
  note: string;
  anagrafica: AnagraficaResoluzione | null;
  hasCompetenzaData: boolean;
  hasMovimentiAnalitici: boolean;
  // Campi arricchiti dal backend
  contoDenominazione?: string;
  tipoRiga?: string;
  isAllocabile?: boolean;
  classeContabile?: string;
  tipoConto?: 'C' | 'F' | 'E' | string; // C=Cliente, F=Fornitore, E=Entrambi - per logica sottoconto intelligente
}

export interface VirtualRigaIva {
  riga: string;
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
  dataRegistrazione: string;
  causale: string;
  descrizione: string;
  numeroDocumento?: string;
  dataDocumento?: string;
  righeContabili: VirtualRigaContabile[];
  righeIva: VirtualRigaIva[];
  allocazioni: VirtualAllocazione[];
  totaliDare: number;
  totaliAvere: number;
  isQuadrata: boolean;
  allocationStatus: AllocationStatus;
}

export interface RigheAggregationResponse {
  scritture: VirtualScrittura[];
  totalScrittureCount: number;
  quadrateScrittureCount: number;
  nonQuadrateScrittureCount: number;
  totalRigheCount: number;
}

// --- Sezione C: Stato Allocazioni ---
export type AllocationStatus = 'non_allocato' | 'parzialmente_allocato' | 'completamente_allocato';

export interface VirtualMovimento {
  scrittura: VirtualScrittura;
  anagraficheRisolte: AnagraficaResoluzione[];
  totaleMovimento: number;
  tipoMovimento: 'COSTO' | 'RICAVO' | 'ALTRO';
  allocationPercentage: number;
  businessValidations: ValidationResult[];
}

export interface AllocationStatusResponse {
  allocationsByStatus: Record<AllocationStatus, number>;
  totalAllocations: number;
  averageAllocationPercentage: number;
  topUnallocatedMovements: VirtualMovimento[];
}

// --- Sezione D: Presentazione Utente ---
export interface UserMovementsResponse {
  movimenti: VirtualMovimento[];
  totalMovimenti: number;
  costiTotal: number;
  ricaviTotal: number;
  altroTotal: number;
}

export interface MovementSummary {
  title: string;
  description: string;
  amount: string;
  formattedAmount: string;
  type: string;
  allocationStatus: string;
  allocationPercentage: string;
  righeCount: number;
  righeIvaCount: number;
  allocazioniCount: number;
  keyHighlights: string[];
  actionItems: string[];
}

// --- Sezione E: Test Workflow Allocazione ---
export interface AllocationWorkflowFilters extends MovimentiContabiliFilters {
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

// --- Sezione F: Validazioni Business ---
export interface ValidationResult {
  rule: string;
  passed: boolean;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface BusinessValidationTestRequest {
  validationRules?: string[];
  includeSeverityLevels?: ('ERROR' | 'WARNING' | 'INFO')[];
}

export interface BusinessValidationTestResponse {
  validationResults: ValidationResult[];
  totalRulesApplied: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

// --- Hook State Management ---
export interface SectionState<T = any> {
  loading: boolean;
  error: string | null;
  data: T | null;
  hasData: boolean;
}

export interface StagingAnalysisHookReturn {
  // Data fetching functions
  fetchAnagraficheResolution: () => Promise<AnagraficheResolutionResponse | null>;
  fetchRigheAggregation: () => Promise<RigheAggregationResponse | null>;
  fetchAllocationStatus: () => Promise<AllocationStatusResponse | null>;
  fetchUserMovements: () => Promise<UserMovementsResponse | null>;
  testAllocationWorkflow: (testData: AllocationWorkflowTestRequest) => Promise<AllocationWorkflowTestResponse | null>;
  testBusinessValidations: (testData?: BusinessValidationTestRequest) => Promise<BusinessValidationTestResponse | null>;

  // Utility functions
  refreshAllSections: () => Promise<void>;
  clearSectionData: (section: string) => void;
  getSectionState: (section: string) => SectionState;

  // Global state
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  data: Record<string, any>;
  isAnyLoading: boolean;
  hasAnyError: boolean;
  totalSections: number;
  loadedSections: number;
}

// --- Utility Types ---
export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: any) => React.ReactNode;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ProcessingStats {
  totalRecords: number;
  processedRecords: number;
  errorRecords: number;
  processingTime: number;
  startTime: string;
  endTime?: string;
}

// --- Component Props ---
export interface SectionComponentProps {
  refreshTrigger?: number;
  className?: string;
  showHeader?: boolean;
  showStats?: boolean;
}

export interface ExpandableTableProps {
  data: any[];
  columns: TableColumn[];
  expandedContent?: (record: any) => React.ReactNode;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
}

// --- Constants ---
export const SECTION_NAMES = {
  ANAGRAFICHE: 'anagrafiche',
  RIGHE: 'righe',
  ALLOCATIONS: 'allocations',
  MOVEMENTS: 'movements',
  WORKFLOW: 'workflow',
  VALIDATIONS: 'validations'
} as const;

export type SectionName = typeof SECTION_NAMES[keyof typeof SECTION_NAMES];

export const VALIDATION_SEVERITIES = ['ERROR', 'WARNING', 'INFO'] as const;
export type ValidationSeverity = typeof VALIDATION_SEVERITIES[number];

export const ALLOCATION_STATUSES = ['non_allocato', 'parzialmente_allocato', 'completamente_allocato'] as const;

export const MOVIMENTO_TYPES = ['COSTO', 'RICAVO', 'ALTRO'] as const;
export type MovimentoType = typeof MOVIMENTO_TYPES[number];

// --- Sezione G: Movimenti Contabili Completi ---
export interface MovimentoContabileCompleto {
  testata: {
    codiceUnivocoScaricamento: string;
    dataRegistrazione: string; // YYYY-MM-DD
    dataDocumento?: string;
    numeroDocumento: string;
    codiceCausale: string;
    descrizioneCausale: string;
    causaleDecodificata: string;
    soggettoResolve: AnagraficaResoluzione;
  };
  righeDettaglio: VirtualRigaContabile[];
  righeIva: VirtualRigaIva[];
  allocazioni?: VirtualAllocazione[];
  totaliDare: number;
  totaliAvere: number;
  statoDocumento: 'Draft' | 'Posted' | 'Validated';
  filtriApplicabili: string[];
}

export interface MovimentiContabiliFilters {
  dataDa?: string; // YYYY-MM-DD
  dataA?: string;  // YYYY-MM-DD
  soggetto?: string; // Ricerca parziale
  stato?: 'D' | 'P' | 'V' | 'ALL'; // Draft, Posted, Validated, All
  page?: number;
  limit?: number;
}

export interface MovimentiContabiliResponse {
  movimenti: MovimentoContabileCompleto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filtriApplicati: MovimentiContabiliFilters;
  statistiche: {
    totalMovimenti: number;
    totalImporto: number;
    movimentiQuadrati: number;
    movimentiAllocabili: number;
  };
}