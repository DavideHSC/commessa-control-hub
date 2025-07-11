export * from '@prisma/client';
import { Commessa, Cliente, ScritturaContabile, RigaScrittura, Conto, StagingConto, VoceAnalitica, StagingRigaContabile } from "@prisma/client";

// Tipi personalizzati che estendono i modelli Prisma
export type CommessaWithRelations = Commessa & {
  cliente: Cliente | null;
  padre: Commessa | null;
  figlie: Commessa[];
  totale_costi: number;
  totale_ricavi: number;
};

export type StagingContoWithRelations = StagingConto;

export type RegistrazioneWithRelations = ScritturaContabile & {
    righe: (RigaScrittura & {
        conto: Conto;
    })[];
};

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

// Tipi per il processo di riconciliazione
export interface ReconciliationSummaryData {
  totalScrittureToProcess: number;
  totalRigheToProcess: number;
  reconciledAutomatically: number;
  needsManualReconciliation: number;
}

// Definisce la struttura dati esatta che la UI di riconciliazione si aspetta.
// Non estende più StagingRigaContabile direttamente, ma è un tipo personalizzato.
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