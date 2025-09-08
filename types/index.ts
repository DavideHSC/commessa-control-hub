// Importa esplicitamente solo i tipi che ti servono da Prisma
import type { Commessa, Cliente, StagingConto, VoceAnalitica } from "@prisma/client";

// Tipi personalizzati che estendono i modelli Prisma
export type CommessaWithRelations = Commessa & {
  cliente: Cliente | null;
  padre: Commessa | null;
  figlie: Commessa[];
  totale_costi: number;
  totale_ricavi: number;
};

export type StagingContoWithRelations = StagingConto;

// NOTA: Questi tipi Prisma sono stati spostati qui e resi custom per evitare dipendenze dirette nel frontend
// export type RegistrazioneWithRelations = ScritturaContabile & {
//     righe: (RigaScrittura & {
//         conto: Conto;
//     })[];
// };

// Tipo semplificato per i conti nell'interfaccia utente
export interface ContoForUI {
  id: string;
  codice: string;
  nome: string;
}

export type VoceAnaliticaWithRelations = VoceAnalitica & {
  conti: ContoForUI[];
};

export interface TableStats {
  [tableName: string]: {
    count: number;
    name: string;
  };
} 

// --- TIPI SPOSTATI DA reconciliation.ts E ALTRI FILE ---

// Tipi per il processo di riconciliazione
export interface ReconciliationSummaryData {
  totalScrittureToProcess: number;
  totalRigheToProcess: number;
  reconciledAutomatically: number;
  needsManualReconciliation: number;
}

export type RigaDaRiconciliare = {
  id: string; 
  externalId: string;
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

export interface AllocationStats {
  unallocatedCount: number;
  totalUnallocatedAmount: number;
  totalMovements: number;
  finalizedCount: number;
  allocationPercentage: number;
}

// Tipi per la Dashboard
export interface CommessaDashboard {
  id: string;
  nome: string;
  cliente: {
    id: string;
    nome: string;
  };
  stato: string;
  ricavi: number;
  costi: number;
  margine: number;
  budget: number;
  percentualeAvanzamento: number;
  isParent: boolean;
  parentId?: string;
  figlie?: CommessaDashboard[];
}

export interface DashboardData {
  commesse: CommessaDashboard[];
  clienti: Array<{ id: string; nome: string; externalId?: string }>;
  kpi: {
    commesseAttive: number;
    ricaviTotali: number;
    costiTotali: number;
    margineLordoMedio: number;
    commesseConMargineNegativo: number;
    budgetVsConsuntivo: number;
    movimentiNonAllocati: number;
    ricaviMeseCorrente: number;
    costiMeseCorrente: number;
  };
  trends: {
    ricaviMensili: Array<{ mese: string; ricavi: number; costi: number; margine: number }>;
    topCommesse: Array<{ nome: string; margine: number; ricavi: number }>;
  };
}

// Tipi per le Registrazioni Contabili
export interface ScritturaContabile {
  id: string;
  data: string; 
  causaleId: string;
  descrizione: string;
  righe: RigaScrittura[];
  datiAggiuntivi?: {
    fornitoreId?: string | null;
    clienteId?: string | null;
    totaleFattura?: number | string;
    aliquotaIva?: number;
  };
}

export interface RigaScrittura {
  id: string;
  descrizione: string;
  dare: number;
  avere: number;
  contoId: string;
  allocazioni: Allocazione[];
}

export interface Allocazione {
  id: string;
  commessaId: string;
  voceAnaliticaId: string;
  importo: number;
  descrizione?: string;
}

// =============================================================================
// STANDARDIZED IMPORT RESULT TYPES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  row?: number;
  value?: string | number | null;
}

export interface ImportWarning {
  field: string;
  message: string;
  row?: number;
  value?: string | number | null;
}

export interface ImportStats {
  totalRecords: number;
  createdRecords: number;
  updatedRecords: number;
  errorRecords: number;
  warningRecords: number;
}

export interface ImportMetadata {
  fileName?: string;
  fileSize?: number;
  processingTime?: number;
  jobId?: string;
  endpoint?: string;
  fileType?: string;
  endpoints?: Record<string, string | null>;
  performanceMetrics?: Record<string, number>;
}

export interface StandardImportResult {
  success: boolean;
  message: string;
  stats: ImportStats;
  metadata?: ImportMetadata;
  validationErrors?: ValidationError[];
  warnings?: ImportWarning[];
  reportDetails?: Record<string, unknown>;
}

// Legacy compatibility interfaces (to be phased out)
export interface LegacyImportResult {
  success: boolean;
  message?: string;
  stats?: Record<string, unknown>;
  errors?: unknown[];
  data?: unknown;
  details?: unknown;
}