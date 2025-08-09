import { useState, useCallback } from 'react';

// Tipi per Piano dei Conti
interface PianoDeiContiReport {
  success: boolean;
  message: string;
  stats: {
    totalRecords: number;
    createdRecords: number;
    updatedRecords: number;
    errors: number;
  };
}

interface PianoDeiContiState {
  status: 'idle' | 'uploading' | 'completed' | 'failed';
  error: string | null;
  report: PianoDeiContiReport['stats'] | null;
}

export const useImportPianoDeiConti = () => {
  const [state, setState] = useState<PianoDeiContiState>({
    status: 'idle',
    error: null,
    report: null
  });

  const startImport = useCallback(async (file: File) => {
    // Reset state e inizia upload
    setState({
      status: 'uploading',
      error: null,
      report: null
    });

    try {
      // Crea FormData per l'upload
      const formData = new FormData();
      formData.append('file', file);

      // Esegui la richiesta POST
      const response = await fetch('/api/v2/import/piano-dei-conti', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse della risposta
      const result = await response.json() as PianoDeiContiReport;

      if (result.success) {
        // Import completato con successo
        setState({
          status: 'completed',
          error: null,
          report: result.stats
        });
      } else {
        // Import fallito ma risposta valida
        setState({
          status: 'failed',
          error: result.message || 'Import failed',
          report: null
        });
      }

    } catch (error) {
      // Errore di rete o parsing
      setState({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        report: null
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      error: null,
      report: null
    });
  }, []);

  return {
    status: state.status,
    error: state.error,
    report: state.report,
    startImport,
    reset
  };
};