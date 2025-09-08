import { useState, useCallback, useRef, useEffect } from 'react';

interface ImportFiles {
  pntesta: File;
  pnrigcon: File;
  pnrigiva?: File;
  movanac?: File;
}

interface ImportEvent {
  timestamp: string;
  level: string;
  message: string;
  details?: any;
}

interface ValidationError {
  field: string;
  message: string;
  row?: number;
}

interface ImportWarning {
  field: string;
  message: string;
  row?: number;
}

// API Response Types
interface StartImportResponse {
  success: boolean;
  jobId: string;
  message: string;
  endpoints: {
    jobStatus: string;
    errors: string | null;
  };
}

interface JobStatusResponse {
  success: boolean;
  jobId: string;
  status: 'running' | 'completed' | 'failed';
  events: ImportEvent[];
  report?: any;
}

interface JobErrorsResponse {
  success: boolean;
  jobId: string;
  errors: ValidationError[];
  pagination: any;
}

interface ImportState {
  status: 'idle' | 'uploading' | 'polling' | 'completed' | 'failed';
  jobId: string | null;
  progress: ImportEvent[];
  error: string | null;
  validationErrors: ValidationError[];
  warnings: ImportWarning[];
  report: any | null;
}

export const useImportScritture = () => {
  const [state, setState] = useState<ImportState>({
    status: 'idle',
    jobId: null,
    progress: [],
    error: null,
    validationErrors: [],
    warnings: [],
    report: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchErrors = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/import/scritture-contabili/errors/${jobId}`);
      if (response.ok) {
        const result = await response.json() as JobErrorsResponse;
        setState(prev => ({
          ...prev,
          validationErrors: result.errors || []
        }));
      }
    } catch (error) {
      console.error('Error fetching validation errors:', error);
    }
  }, []);

  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/import/scritture-contabili/job/${jobId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as JobStatusResponse;
      
      setState(prev => ({
        ...prev,
        // Aggiorna lo stato solo se è ancora 'polling' per evitare race conditions
        status: prev.status === 'polling' ? (result.status === 'running' ? 'polling' : result.status) : prev.status,
        progress: result.events || [],
        // Salva il report se il job è completato
        report: result.status === 'completed' ? result.report || null : prev.report,
      }));

      // La logica per fermare il polling e fetchare gli errori rimane, ma usa il nuovo 'result.status'
      if (result.status === 'completed' || result.status === 'failed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (result.status === 'failed') {
          await fetchErrors(jobId);
        }
      }
    } catch (error) {
      console.error('Error polling status:', error);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: 'Failed to check import status'
      }));
    }
  }, [fetchErrors]);

  const startImport = useCallback(async (files: ImportFiles) => {
    // Reset state
    setState({
      status: 'uploading',
      jobId: null,
      progress: [],
      error: null,
      validationErrors: [],
      warnings: [],
      report: null
    });

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      const formData = new FormData();
      formData.append('pntesta', files.pntesta);
      formData.append('pnrigcon', files.pnrigcon);
      
      if (files.pnrigiva) {
        formData.append('pnrigiva', files.pnrigiva);
      }
      
      if (files.movanac) {
        formData.append('movanac', files.movanac);
      }

      const response = await fetch('/api/import/scritture-contabili', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as StartImportResponse;
      const jobId = result.jobId;

      if (!jobId) {
        throw new Error('No job ID received from server');
      }

      setState(prev => ({
        ...prev,
        status: 'polling',
        jobId
      }));

      // Start polling
      intervalRef.current = setInterval(() => {
        pollStatus(jobId);
      }, 2000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [pollStatus]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({
      status: 'idle',
      jobId: null,
      progress: [],
      error: null,
      validationErrors: [],
      warnings: [],
      report: null
    });
  }, []);

  return {
    status: state.status,
    progress: state.progress,
    error: state.error,
    validationErrors: state.validationErrors,
    warnings: state.warnings,
    report: state.report,
    startImport,
    reset
  };
};