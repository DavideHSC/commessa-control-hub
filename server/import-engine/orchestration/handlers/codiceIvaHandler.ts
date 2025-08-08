import { Request, Response } from 'express';
import { runImportCodiciIvaWorkflow } from '../workflows/importCodiceIvaWorkflow';

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
    const result = await runImportCodiciIvaWorkflow(fileContent);
    
    // **RESPONSE FINALE**
    console.log('✅ Import codici IVA completato con successo');
    
    res.status(200).json({
      success: true,
      message: 'Importazione codici IVA completata con successo',
      fileName: req.file.originalname,
      totalRecords: result.stats.totalRecords,
      createdCount: result.stats.successfulRecords,
      updatedCount: 0, // Per ora non distinguiamo tra create e update
      errors: result.errors,
      warnings: []
    });
    
  } catch (error: unknown) {
    console.error('💥 Errore interno durante import codici IVA:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server durante l\'importazione',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 