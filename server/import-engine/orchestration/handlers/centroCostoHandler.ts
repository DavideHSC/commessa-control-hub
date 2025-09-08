/**
 * CENTRO COSTO HANDLER
 * Handler HTTP per importazione centri di costo ANAGRACC.TXT
 * 
 * Endpoint: POST /api/v2/import/centri-costo
 * Pattern: Multipart Upload → Workflow → Response
 */

import { Request, Response } from 'express';
import { executeCentriCostoImportWorkflow } from '../workflows/importCentriCostoWorkflow.js';
import { formatImportResult } from '../../core/utils/resultFormatter.js';

export interface CentroCostoImportRequest {
  templateName?: string;
}

/**
 * Handler per importazione centri di costo via API v2
 */
export async function handleCentroCostoImport(req: Request, res: Response): Promise<void> {
  console.log('🚀 POST /api/v2/import/centri-costo - Inizio importazione centri di costo');
  
  try {
    // Validazione file upload
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'File non fornito. È richiesto un file ANAGRACC.TXT.',
        error: 'MISSING_FILE'
      });
      return;
    }
    
    // Validazione tipo file
    const allowedExtensions = ['.txt', '.TXT'];
    const fileExtension = req.file.originalname.substring(req.file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      res.status(400).json({
        success: false,
        message: `Tipo file non supportato. Estensioni ammesse: ${allowedExtensions.join(', ')}`,
        error: 'INVALID_FILE_TYPE'
      });
      return;
    }
    
    // Validazione nome file (opzionale ma raccomandato per ANAGRACC)
    const fileName = req.file.originalname.toUpperCase();
    if (!fileName.includes('ANAGRACC')) {
      console.log(`⚠️  Warning: File name "${req.file.originalname}" non contiene "ANAGRACC" - procedo comunque`);
    }
    
    // Estrazione parametri richiesta
    const { templateName = 'centri_costo' }: CentroCostoImportRequest = req.body;
    
    console.log(`📄 File: ${req.file.originalname} (${req.file.size} bytes)`);
    console.log(`🔧 Template: ${templateName}`);
    
    // Conversione file buffer a stringa
    const fileContent = req.file.buffer.toString('utf-8');
    
    if (fileContent.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'File vuoto o non leggibile.',
        error: 'EMPTY_FILE'
      });
      return;
    }
    
    console.log(`📊 Contenuto file: ${fileContent.length} caratteri, ${fileContent.split('\n').length} righe`);
    
    // **WORKFLOW ORCHESTRAZIONE**
    console.log('🔄 Esecuzione workflow importazione centri di costo...');
    const workflowResult = await executeCentriCostoImportWorkflow(fileContent, templateName);
    
    // **RESPONSE FORMATTING**
    const response = formatImportResult(workflowResult, 'centri-costo', req.file.originalname, req.file.size);
    
    // Status code basato su risultato
    const statusCode = workflowResult.success ? 200 : 400;
    
    console.log(`✅ Import centri di costo completato:`, {
      success: workflowResult.success,
      totalRecords: workflowResult.stats.totalRecords,
      successfulRecords: workflowResult.stats.successfulRecords,
      errorRecords: workflowResult.stats.errorRecords,
      warnings: workflowResult.stats.warnings.length
    });
    
    res.status(statusCode).json(response);
    
  } catch (error) {
    console.error('❌ Errore critico nell\'handler centri di costo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server durante l\'importazione centri di costo.',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handler per validazione readiness centri di costo staging
 * Endpoint: GET /api/v2/import/centri-costo/validate
 */
export async function handleCentriCostoValidation(req: Request, res: Response): Promise<void> {
  console.log('🔍 GET /api/v2/import/centri-costo/validate - Validazione staging readiness');
  
  try {
    const { validateCentriCostoStagingReadiness } = await import('../workflows/importCentriCostoWorkflow.js');
    const validation = await validateCentriCostoStagingReadiness();
    
    res.status(200).json({
      success: validation.isReady,
      message: validation.isReady 
        ? `Staging pronto: ${validation.totalCentriCosto} centri di costo disponibili`
        : `Staging non pronto: ${validation.issues.length} problemi rilevati`,
      data: {
        isReady: validation.isReady,
        totalCentriCosto: validation.totalCentriCosto,
        issues: validation.issues
      }
    });
    
  } catch (error) {
    console.error('❌ Errore validazione centri di costo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore durante la validazione centri di costo.',
      error: 'VALIDATION_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}