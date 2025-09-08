/**
 * CENTRALIZED IMPORT RESULT FORMATTER
 * 
 * Utility per standardizzare gli output di tutti i parsers/handlers del sistema di importazione.
 * Converte i vari formati legacy in StandardImportResult uniforme per il frontend.
 */

import { StandardImportResult, ImportStats, ImportMetadata, ValidationError, ImportWarning } from '../../../../types/index.js';

// =============================================================================
// BASE FORMATTER UTILITY
// =============================================================================

/**
 * Crea un StandardImportResult base
 */
export function createStandardResult(
  success: boolean,
  message: string,
  stats: ImportStats,
  metadata?: ImportMetadata,
  validationErrors?: ValidationError[],
  warnings?: ImportWarning[],
  reportDetails?: Record<string, any>
): StandardImportResult {
  return {
    success,
    message,
    stats,
    metadata,
    validationErrors: validationErrors || [],
    warnings: warnings || [],
    reportDetails
  };
}

/**
 * Crea ImportStats da valori base
 */
export function createImportStats(
  totalRecords: number,
  createdRecords: number = 0,
  updatedRecords: number = 0,
  errorRecords: number = 0,
  warningRecords: number = 0
): ImportStats {
  return {
    totalRecords,
    createdRecords,
    updatedRecords,
    errorRecords,
    warningRecords
  };
}

/**
 * Crea ImportMetadata da parametri opzionali
 */
export function createImportMetadata(
  fileName?: string,
  fileSize?: number,
  processingTime?: number,
  jobId?: string,
  additionalData?: Record<string, any>
): ImportMetadata {
  return {
    fileName,
    fileSize,
    processingTime,
    jobId,
    ...additionalData
  };
}

// =============================================================================
// SPECIALIZED FORMATTERS FOR EACH IMPORT TYPE
// =============================================================================

/**
 * Formatter per Anagrafiche (A_CLIFOR.TXT)
 * Converte il formato complesso del handler anagrafiche
 */
export function formatAnagraficheResult(
  workflowResult: any,
  fileName?: string,
  fileSize?: number,
  processingTime?: number
): StandardImportResult {
  const success = workflowResult.success || false;
  const message = workflowResult.message || (success ? 'Importazione anagrafiche completata' : 'Importazione anagrafiche fallita');
  
  const stats = createImportStats(
    workflowResult.stats?.totalRecords || 0,
    workflowResult.stats?.successfulRecords || workflowResult.stats?.createdRecords || 0, // Fix: Prima prova successfulRecords, poi createdRecords
    workflowResult.stats?.updatedRecords || 0,
    workflowResult.stats?.errorRecords || workflowResult.errors?.length || 0,
    0 // warnings non presenti nel formato originale
  );

  const metadata = createImportMetadata(fileName, fileSize, processingTime);

  const validationErrors: ValidationError[] = (workflowResult.errors || []).map((err: any) => ({
    field: err.field || 'unknown',
    message: err.message || 'Validation error',
    row: err.row,
    value: err.value
  }));

  const reportDetails = workflowResult.anagraficheStats ? {
    transformation: workflowResult.anagraficheStats,
    parsing: {
      totalRecords: workflowResult.stats?.totalRecords || 0,
      successfulRecords: workflowResult.stats?.successfulRecords || 0,
      errorRecords: workflowResult.stats?.errorRecords || 0
    }
  } : undefined;

  return createStandardResult(success, message, stats, metadata, validationErrors, [], reportDetails);
}

/**
 * Formatter per Causali Contabili (CAUSALI.TXT)
 * Converte il formato minimale del handler causali
 */
export function formatCausaliContabiliResult(
  workflowResult: any,
  fileName?: string,
  fileSize?: number,
  processingTime?: number
): StandardImportResult {
  const success = workflowResult.success || false;
  const message = workflowResult.message || (success ? 'Importazione causali contabili completata' : 'Importazione causali contabili fallita');
  
  const stats = createImportStats(
    workflowResult.stats?.totalRecords || 0,
    workflowResult.stats?.successfulRecords || workflowResult.stats?.createdRecords || 0, // Fix: Prima prova successfulRecords, poi createdRecords
    workflowResult.stats?.updatedRecords || 0,
    workflowResult.stats?.errorRecords || workflowResult.errors?.length || 0,
    0
  );

  const metadata = createImportMetadata(fileName, fileSize, processingTime);

  const validationErrors: ValidationError[] = (workflowResult.errors || []).map((err: any) => ({
    field: err.field || 'unknown',
    message: err.message || 'Validation error',
    row: err.row,
    value: err.value
  }));

  return createStandardResult(success, message, stats, metadata, validationErrors);
}

/**
 * Formatter per Codici IVA (CODICIVA.TXT)
 * Converte il formato con fileName del handler codici IVA
 */
export function formatCodiciIvaResult(
  workflowResult: any,
  fileName?: string,
  fileSize?: number,
  processingTime?: number
): StandardImportResult {
  const success = workflowResult.success || false;
  const message = workflowResult.message || (success ? 'Importazione codici IVA completata' : 'Importazione codici IVA fallita');
  
  const stats = createImportStats(
    workflowResult.stats?.totalRecords || 0,
    workflowResult.stats?.successfulRecords || workflowResult.stats?.createdRecords || 0, // Fix: Prima prova successfulRecords, poi createdRecords
    workflowResult.stats?.updatedRecords || 0,
    workflowResult.stats?.errorRecords || workflowResult.errors?.length || 0,
    0 // warnings non presenti nel workflow codici IVA
  );

  const metadata = createImportMetadata(
    fileName || workflowResult.fileName,
    fileSize,
    processingTime
  );

  const validationErrors: ValidationError[] = (workflowResult.errors || []).map((err: any) => ({
    field: err.field || 'unknown',
    message: err.message || 'Validation error',
    row: err.row,
    value: err.value
  }));

  const warnings: ImportWarning[] = (workflowResult.warnings || []).map((warn: any) => ({
    field: warn.field || 'unknown',
    message: warn.message || 'Warning',
    row: warn.row,
    value: warn.value
  }));

  return createStandardResult(success, message, stats, metadata, validationErrors, warnings);
}

/**
 * Formatter per Condizioni di Pagamento (CODPAGAM.TXT)
 * Converte il formato diretto dal workflow
 */
export function formatCondizioniPagamentoResult(
  workflowResult: any,
  fileName?: string,
  fileSize?: number,
  processingTime?: number
): StandardImportResult {
  const success = workflowResult.success !== false; // Default true se non specificato
  const message = workflowResult.message || (success ? 'Importazione condizioni pagamento completata' : 'Importazione condizioni pagamento fallita');
  
  const stats = createImportStats(
    workflowResult.stats?.totalRecords || 0,
    workflowResult.stats?.successfulRecords || workflowResult.stats?.createdRecords || 0, // Fix: Prima prova successfulRecords, poi createdRecords
    workflowResult.stats?.updatedRecords || 0,
    workflowResult.stats?.errorRecords || workflowResult.errors?.length || 0,
    0
  );

  const metadata = createImportMetadata(fileName, fileSize, processingTime);

  const validationErrors: ValidationError[] = (workflowResult.errors || []).map((err: any) => ({
    field: err.field || 'unknown',
    message: err.message || 'Validation error',
    row: err.row,
    value: err.value
  }));

  return createStandardResult(success, message, stats, metadata, validationErrors);
}

/**
 * Formatter per Piano dei Conti (CONTIGEN/CONTIAZI.TXT)
 * Converte il formato con stats del handler piano dei conti
 */
export function formatPianoDeiContiResult(
  workflowResult: any,
  fileName?: string,
  fileSize?: number,
  processingTime?: number,
  fileType?: 'aziendale' | 'standard'
): StandardImportResult {
  // DEBUG: Verifica che workflowResult non sia undefined
  if (!workflowResult) {
    console.error('[ResultFormatter] workflowResult è undefined o null!');
    return createStandardResult(
      false,
      `Errore interno: risultato workflow non disponibile per piano dei conti (${fileType || 'standard'})`,
      createImportStats(0, 0, 0, 1, 0),
      createImportMetadata(fileName, fileSize, processingTime, undefined, { fileType })
    );
  }

  // FIXED: Smart success determination for Piano dei Conti workflows
  // Since Piano dei Conti workflows don't return explicit success field,
  // determine success based on statistics: success if no errors occurred
  let success = false;
  if (workflowResult.success !== undefined) {
    // If explicit success field is present (future compatibility), use it
    success = workflowResult.success;
  } else {
    // Smart determination: successful if no errors occurred
    const totalRecords = workflowResult.totalRecords || 0;
    const errorRecords = workflowResult.errorRecords || 0;
    const errorsArray = workflowResult.errors || [];
    
    // Success if no errors and either processed some records OR had empty but valid file
    success = (errorRecords === 0 && errorsArray.length === 0);
    console.log(`[ResultFormatter] Piano dei Conti success determination: totalRecords=${totalRecords}, errorRecords=${errorRecords}, errorsLength=${errorsArray.length}, success=${success}`);
  }

  const message = workflowResult.message || (success 
    ? `Importazione piano dei conti (${fileType || 'standard'}) completata` 
    : `Importazione piano dei conti (${fileType || 'standard'}) fallita`
  );
  
  const stats = createImportStats(
    workflowResult.totalRecords || 0,
    workflowResult.createdRecords || 0, // Piano dei Conti returns fields directly, not in stats
    workflowResult.updatedRecords || 0,
    workflowResult.errorRecords || 0,
    0
  );

  const metadata = createImportMetadata(fileName, fileSize, processingTime, undefined, { fileType });

  return createStandardResult(success, message, stats, metadata);
}

/**
 * Formatter per Scritture Contabili (PNTESTA+PNRIGCON+...)
 * Converte il formato complesso con job tracking
 */
export function formatScrittureContabiliResult(
  workflowResult: any,
  fileName?: string,
  fileSize?: number,
  processingTime?: number
): StandardImportResult {
  const success = workflowResult.success || false;
  const message = workflowResult.message || (success ? 'Importazione scritture contabili completata' : 'Importazione scritture contabili fallita');
  
  const stats = createImportStats(
    (workflowResult.stats?.testateStaging || 0) + (workflowResult.stats?.righeContabiliStaging || 0) + (workflowResult.stats?.righeIvaStaging || 0),
    workflowResult.stats?.testateStaging || 0,
    0, // Le scritture non distinguono tra create/update
    workflowResult.stats?.erroriValidazione || 0,
    0
  );

  const metadata = createImportMetadata(
    fileName,
    fileSize,
    processingTime || workflowResult.stats?.processingTime,
    workflowResult.jobId,
    {
      endpoints: workflowResult.endpoints,
      performanceMetrics: workflowResult.stats?.performanceMetrics
    }
  );

  const reportDetails = workflowResult.report ? workflowResult.report : undefined;

  return createStandardResult(success, message, stats, metadata, [], [], reportDetails);
}

// =============================================================================
// AUTO-DETECTION FORMATTER
// =============================================================================

/**
 * Auto-detecta il tipo di risultato e applica il formatter appropriato
 */
export function formatImportResult(
  workflowResult: any,
  importType: 'anagrafiche' | 'causali-contabili' | 'codici-iva' | 'condizioni-pagamento' | 'piano-conti' | 'scritture-contabili',
  fileName?: string,
  fileSize?: number,
  processingTime?: number,
  additionalOptions?: any
): StandardImportResult {
  console.log(`[ResultFormatter] Formatting result for: ${importType}`, {
    workflowStats: workflowResult.stats,
    fileName,
    fileSize,
    processingTime
  });
  
  switch (importType) {
    case 'anagrafiche':
      return formatAnagraficheResult(workflowResult, fileName, fileSize, processingTime);
    
    case 'causali-contabili':
      return formatCausaliContabiliResult(workflowResult, fileName, fileSize, processingTime);
    
    case 'codici-iva':
      return formatCodiciIvaResult(workflowResult, fileName, fileSize, processingTime);
    
    case 'condizioni-pagamento':
      return formatCondizioniPagamentoResult(workflowResult, fileName, fileSize, processingTime);
    
    case 'piano-conti':
      return formatPianoDeiContiResult(workflowResult, fileName, fileSize, processingTime, additionalOptions?.fileType);
    
    case 'scritture-contabili':
      return formatScrittureContabiliResult(workflowResult, fileName, fileSize, processingTime);
    
    default:
      // Fallback per tipi non riconosciuti
      return createStandardResult(
        false,
        'Tipo di importazione non riconosciuto',
        createImportStats(0, 0, 0, 1, 0),
        createImportMetadata(fileName, fileSize, processingTime)
      );
  }
}