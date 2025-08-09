
import { apiClient } from ".";

export interface ReconciliationSummary {
  totalScrittureToProcess: number;
  totalRigheToProcess: number;
  reconciledAutomatically: number;
  needsManualReconciliation: number;
}

export interface RigaDaRiconciliare {
  id: string; // Corretto da number a string per matchare il CUID di Prisma
  codiceUnivocoScaricamento: string;
  progressivoNumeroRigo: number;
  conto: string | null;
  note: string | null;
  importoDare: number | null;
  importoAvere: number | null;
  suggerimentoVoceAnaliticaId: string | undefined;
}

export interface ReconciliationResult {
  message: string;
  summary: ReconciliationSummary;
  data: RigaDaRiconciliare[];
  errors: string[];
}

/**
 * Avvia il processo di analisi per la riconciliazione.
 * Questo endpoint non scrive dati ma restituisce lo stato attuale 
 * e le righe che necessitano di un intervento manuale.
 */
export const runReconciliation = async (): Promise<ReconciliationResult> => {
  const response = await apiClient.post('/reconciliation/run');
  return response.data;
};

// Tipi per la nuova funzione
interface AllocationItem {
    commessaId: string;
    importo: number;
}

export interface ManualAllocationPayload {
    rigaStagingId: string;
    voceAnaliticaId: string;
    allocazioni: AllocationItem[];
}

/**
 * Salva una singola riga di riconciliazione manuale.
 * @param payload I dati per l'allocazione manuale.
 */
export const saveManualAllocation = async (payload: ManualAllocationPayload) => {
    const response = await apiClient.post('/reconciliation/manual-allocation', payload);
    return response.data;
} 