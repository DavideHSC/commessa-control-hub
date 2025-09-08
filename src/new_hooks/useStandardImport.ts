/**
 * STANDARDIZED IMPORT HOOK BASE
 * 
 * Hook base per standardizzare tutti gli import hooks del sistema.
 * Gestisce lo stato comune e la logica di fetch per tutti i tipi di importazione.
 */

import { useState, useCallback } from 'react';
import { StandardImportResult, ValidationError, ImportWarning } from '../../types/index.js';

// Stato standardizzato per tutti gli import hooks
interface StandardImportState {
  status: 'idle' | 'uploading' | 'completed' | 'failed';
  error: string | null;
  report: StandardImportResult | null;
  validationErrors: ValidationError[];
  warnings: ImportWarning[];
}

// Hook base riutilizzabile
export const useStandardImport = (endpoint: string) => {
  const [state, setState] = useState<StandardImportState>({
    status: 'idle',
    error: null,
    report: null,
    validationErrors: [],
    warnings: []
  });

  const startImport = useCallback(async (file: File) => {
    // Reset state e inizia upload
    setState({
      status: 'uploading',
      error: null,
      report: null,
      validationErrors: [],
      warnings: []
    });

    try {
      // Crea FormData per l'upload
      const formData = new FormData();
      formData.append('file', file);

      // Esegui la richiesta POST
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse della risposta standardizzata
      const result = await response.json() as StandardImportResult;

      if (result.success) {
        // Import completato con successo
        setState({
          status: 'completed',
          error: null,
          report: result,
          validationErrors: result.validationErrors || [],
          warnings: result.warnings || []
        });
      } else {
        // Import fallito ma risposta valida
        setState({
          status: 'failed',
          error: result.message || 'Import failed',
          report: result,
          validationErrors: result.validationErrors || [],
          warnings: result.warnings || []
        });
      }

    } catch (error) {
      // Errore di rete o parsing
      setState({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        report: null,
        validationErrors: [],
        warnings: []
      });
    }
  }, [endpoint]);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      error: null,
      report: null,
      validationErrors: [],
      warnings: []
    });
  }, []);

  return {
    status: state.status,
    error: state.error,
    report: state.report,
    validationErrors: state.validationErrors,
    warnings: state.warnings,
    startImport,
    reset
  };
};

// Hook specializzati che utilizzano la base standardizzata
export const useImportCausaliContabiliStandard = () => useStandardImport('/api/import/causali-contabili');
export const useImportCodiciIvaStandard = () => useStandardImport('/api/import/codici-iva');
export const useImportCondizioniPagamentoStandard = () => useStandardImport('/api/import/condizioni-pagamento');
export const useImportPianoDeiContiStandard = () => useStandardImport('/api/import/piano-dei-conti');
export const useImportAnagraficheStandard = () => useStandardImport('/api/import/clienti-fornitori');