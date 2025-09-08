import { Request, Response } from 'express';
import { runImportCodiciIvaWorkflow } from '../workflows/importCodiceIvaWorkflow.js';
import { formatImportResult } from '../../core/utils/resultFormatter.js';

/**
 * HTTP handler for importing Codici IVA.
 * Follows the same pattern as the working causali handler.
 */
export async function handleCodiceIvaImport(req: Request, res: Response): Promise<void> {
  console.log('🚀 POST /api/v2/import/codici-iva - Inizio importazione codici IVA');
  
  try {
    // Validazione file upload
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'File non fornito. È richiesto un file CODICIVA.TXT.',
        error: 'MISSING_FILE'
      });
      return;
    }

    console.log(`📄 File: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Conversione buffer a string (stesso pattern delle causali)
    const fileContent = req.file.buffer.toString('utf-8');
    
    if (fileContent.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'File vuoto o non leggibile.',
        error: 'EMPTY_FILE'
      });
      return;
    }

    console.log(`📊 Dimensione contenuto: ${fileContent.length} caratteri`);
    
    // **ESECUZIONE WORKFLOW** - Passa il contenuto del file
    const startTime = Date.now();
    const workflowResult = await runImportCodiciIvaWorkflow(fileContent);
    const processingTime = Date.now() - startTime;
    
    // **RESPONSE FINALE CON FORMATO STANDARDIZZATO**
    console.log('✅ Import codici IVA completato con successo');
    
    const standardResult = formatImportResult(
      workflowResult,
      'codici-iva',
      req.file.originalname,
      req.file.size,
      processingTime
    );
    
    res.status(200).json(standardResult);
    
  } catch (error: unknown) {
    console.error('💥 Errore interno durante import codici IVA:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Errore interno del server';
    const standardResult = formatImportResult(
      { success: false, message: errorMessage },
      'codici-iva',
      req.file?.originalname,
      req.file?.size
    );
    
    res.status(500).json(standardResult);
  }
} 