/**
 * IMPORT CENTRI COSTO HOOK
 * Hook per importazione centri di costo ANAGRACC.TXT
 * 
 * Pattern: StandardImport → API v2 → Staging → Workflow Response
 * Endpoint: POST /api/v2/import/centri-costo
 */

import { useState, useCallback } from 'react';
import { useStandardImport } from './useStandardImport.js';
import { StandardImportResult } from '../../types/index.js';

// Estensioni specifiche per centri di costo
export interface CentriCostoImportStats {
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  duplicatiRimossi: number;
}

export interface CentriCostoImportResult extends StandardImportResult {
  centriCostoStats?: CentriCostoImportStats;
}

/**
 * Hook per importazione centri di costo
 */
export const useImportCentriCosto = () => {
  const baseHook = useStandardImport('/api/import/centri-costo');
  
  return {
    ...baseHook,
    // Type-safe result con statistiche specifiche centri di costo
    report: baseHook.report as CentriCostoImportResult | null,
    
    // Metadati specifici per centri di costo
    get centriCostoStats() {
      return baseHook.report?.centriCostoStats || null;
    },
    
    // Helper per validazione file
    validateFile: (file: File): string | null => {
      // Validazione estensione
      const allowedExtensions = ['.txt', '.TXT'];
      const extension = file.name.substring(file.name.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(extension)) {
        return `Estensione file non valida. Utilizzare: ${allowedExtensions.join(', ')}`;
      }
      
      // Validazione dimensione (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return 'File troppo grande. Dimensione massima: 10MB';
      }
      
      // Validazione nome file (raccomandato)
      if (!file.name.toUpperCase().includes('ANAGRACC')) {
        // Solo warning, non blocca l'import
        console.warn('⚠️ File name non contiene "ANAGRACC" - assicurarsi che sia il file corretto');
      }
      
      return null; // Nessun errore
    },
    
    // Statistiche user-friendly
    get summary() {
      const stats = baseHook.report?.centriCostoStats;
      if (!stats) return null;
      
      return {
        totale: stats.totalRecords,
        successo: stats.successfulRecords,
        errori: stats.errorRecords,
        duplicati: stats.duplicatiRimossi,
        percentualeSuccesso: stats.totalRecords > 0 
          ? Math.round((stats.successfulRecords / stats.totalRecords) * 100) 
          : 0
      };
    }
  };
};

/**
 * Hook per validazione readiness centri di costo
 */
export const useValidateCentriCosto = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isReady: boolean;
    totalCentriCosto: number;
    issues: string[];
  } | null>(null);

  const validateReadiness = useCallback(async () => {
    setIsValidating(true);
    
    try {
      const response = await fetch('/api/import/centri-costo/validate');
      const result = await response.json();
      
      if (result.success) {
        setValidationResult(result.data);
      } else {
        console.error('Errore validazione centri di costo:', result);
        setValidationResult(null);
      }
    } catch (error) {
      console.error('Errore durante validazione:', error);
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    isValidating,
    validationResult,
    validateReadiness
  };
};

// Export del tipo per uso esterno
export type { CentriCostoImportResult, CentriCostoImportStats };