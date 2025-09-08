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

export const useImportPianoDeiConti = () => {
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

      // Esegui la richiesta POST (Fix: endpoint corretto)
      const response = await fetch('/api/import/piano-dei-conti', {
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
  }, []);

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