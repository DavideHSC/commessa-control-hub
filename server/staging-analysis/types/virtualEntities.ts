// Tipi per entità virtuali - interpretazione diretta di dati staging
// ZERO persistenza - solo rappresentazione logica

export interface VirtualAnagrafica {
  codiceFiscale: string;
  sigla: string;
  subcodice: string;
  tipo: 'CLIENTE' | 'FORNITORE';
  matchedEntity: {
    id: string;
    nome: string;
  } | null;
  matchConfidence: number;
  sourceRows: number; // Quanti record staging lo referenziano
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