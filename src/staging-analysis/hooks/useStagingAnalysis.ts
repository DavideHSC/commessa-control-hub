import { useState, useEffect, useCallback } from 'react';

// Tipi per le risposte API
interface StagingAnalysisResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  processingTime?: number;
}

interface AnagraficheResolutionData {
  anagrafiche: Array<{
    codiceFiscale: string;
    sigla: string;
    subcodice: string;
    tipo: 'CLIENTE' | 'FORNITORE';
    matchedEntity: { id: string; nome: string } | null;
    matchConfidence: number;
    sourceRows: number;
  }>;
  totalRecords: number;
  matchedRecords: number;
  unmatchedRecords: number;
}

interface RigheAggregationData {
  scritture: Array<{
    codiceUnivocoScaricamento: string;
    dataRegistrazione: string;
    descrizione: string;
    righeContabili: any[];
    righeIva: any[];
    allocazioni: any[];
    totaliDare: number;
    totaliAvere: number;
    isQuadrata: boolean;
    allocationStatus: string;
  }>;
  totalScrittureCount: number;
  quadrateScrittureCount: number;
  nonQuadrateScrittureCount: number;
  totalRigheCount: number;
}

interface AllocationStatusData {
  allocationsByStatus: Record<string, number>;
  totalAllocations: number;
  averageAllocationPercentage: number;
  topUnallocatedMovements: any[];
}

interface UserMovementsData {
  movimenti: any[];
  totalMovimenti: number;
  costiTotal: number;
  ricaviTotal: number;
  altroTotal: number;
}

interface AllocationWorkflowResult {
  success: boolean;
  virtualAllocations: any[];
  validations: Array<{
    rule: string;
    passed: boolean;
    message: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
  }>;
  totalAllocatedAmount: number;
  remainingAmount: number;
}

interface BusinessValidationData {
  validationResults: Array<{
    rule: string;
    passed: boolean;
    message: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
  }>;
  totalRulesApplied: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

// Hook principale per la pagina di staging analysis
export const useStagingAnalysis = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [data, setData] = useState<Record<string, any>>({});

  // Helper per gestire loading e error per sezione
  const setLoadingForSection = useCallback((section: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [section]: isLoading }));
  }, []);

  const setErrorForSection = useCallback((section: string, errorMessage: string | null) => {
    setError(prev => ({ ...prev, [section]: errorMessage }));
  }, []);

  const setDataForSection = useCallback((section: string, sectionData: any) => {
    setData(prev => ({ ...prev, [section]: sectionData }));
  }, []);

  // Generic fetch function
  const fetchData = useCallback(async <T>(
    endpoint: string, 
    section: string,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoadingForSection(section, true);
    setErrorForSection(section, null);

    try {
      const response = await fetch(`/api/staging-analysis/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: StagingAnalysisResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.data as any || 'API returned error');
      }

      setDataForSection(section, result.data);
      return result.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error fetching ${section}:`, error);
      setErrorForSection(section, errorMessage);
      return null;
    } finally {
      setLoadingForSection(section, false);
    }
  }, [setLoadingForSection, setErrorForSection, setDataForSection]);

  // Sezione A: Risoluzione Anagrafica
  const fetchAnagraficheResolution = useCallback(async (): Promise<AnagraficheResolutionData | null> => {
    return await fetchData<AnagraficheResolutionData>('anagrafiche-resolution', 'anagrafiche');
  }, [fetchData]);

  // Sezione B: Aggregazione Righe
  const fetchRigheAggregation = useCallback(async (): Promise<RigheAggregationData | null> => {
    return await fetchData<RigheAggregationData>('righe-aggregation', 'righe');
  }, [fetchData]);

  // Sezione C: Stato Allocazioni
  const fetchAllocationStatus = useCallback(async (): Promise<AllocationStatusData | null> => {
    return await fetchData<AllocationStatusData>('allocation-status', 'allocations');
  }, [fetchData]);

  // Sezione D: Presentazione Utente
  const fetchUserMovements = useCallback(async (): Promise<UserMovementsData | null> => {
    return await fetchData<UserMovementsData>('user-movements', 'movements');
  }, [fetchData]);

  // Sezione E: Test Workflow Allocazione
  const testAllocationWorkflow = useCallback(async (testData: {
    rigaScritturaIdentifier: string;
    proposedAllocations: Array<{
      commessaExternalId: string;
      voceAnaliticaNome: string;
      importo: number;
    }>;
  }): Promise<AllocationWorkflowResult | null> => {
    return await fetchData<AllocationWorkflowResult>('test-allocation-workflow', 'workflow', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }, [fetchData]);

  // Sezione F: Test Validazioni Business
  const testBusinessValidations = useCallback(async (testData: {
    validationRules?: string[];
    includeSeverityLevels?: ('ERROR' | 'WARNING' | 'INFO')[];
  } = {}): Promise<BusinessValidationData | null> => {
    return await fetchData<BusinessValidationData>('test-business-validations', 'validations', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }, [fetchData]);

  // Refresh function per tutte le sezioni
  const refreshAllSections = useCallback(async () => {
    const promises = [
      fetchAnagraficheResolution(),
      fetchRigheAggregation(),
      fetchAllocationStatus(),
      fetchUserMovements()
    ];

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error refreshing all sections:', error);
    }
  }, [fetchAnagraficheResolution, fetchRigheAggregation, fetchAllocationStatus, fetchUserMovements]);

  // Clear data for section
  const clearSectionData = useCallback((section: string) => {
    setDataForSection(section, null);
    setErrorForSection(section, null);
    setLoadingForSection(section, false);
  }, [setDataForSection, setErrorForSection, setLoadingForSection]);

  // Get helpers per ogni sezione
  const getSectionState = useCallback((section: string) => ({
    loading: loading[section] || false,
    error: error[section] || null,
    data: data[section] || null,
    hasData: !!data[section]
  }), [loading, error, data]);

  return {
    // Data fetching functions
    fetchAnagraficheResolution,
    fetchRigheAggregation, 
    fetchAllocationStatus,
    fetchUserMovements,
    testAllocationWorkflow,
    testBusinessValidations,

    // Utility functions
    refreshAllSections,
    clearSectionData,
    getSectionState,

    // Raw state (per advanced usage)
    loading,
    error,
    data,

    // Computed states
    isAnyLoading: Object.values(loading).some(Boolean),
    hasAnyError: Object.values(error).some(Boolean),
    totalSections: 6,
    loadedSections: Object.keys(data).filter(key => data[key] !== null).length
  };
};

// Hook specializzato per una singola sezione
export const useSectionData = <T = any>(
  sectionName: string,
  fetchFunction: () => Promise<T | null>,
  autoLoad: boolean = false
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const fetch = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const refresh = useCallback(() => {
    return fetch();
  }, [fetch]);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-load on mount if requested
  useEffect(() => {
    if (autoLoad) {
      fetch();
    }
  }, [autoLoad, fetch]);

  return {
    loading,
    error,
    data,
    hasData: data !== null,
    fetch,
    refresh,
    clear
  };
};