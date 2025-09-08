import { Request, Response } from 'express';
import { runImportCausaliContabiliWorkflow } from '../workflows/importCausaliContabiliWorkflow.js';
import { formatImportResult } from '../../core/utils/resultFormatter.js';

/**
 * Gestisce la richiesta HTTP per l'importazione delle causali contabili.
 * @param req La richiesta Express.
 * @param res La risposta Express.
 */
export async function handleCausaleContabileImport(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ message: 'Nessun file caricato.' });
    return;
  }

  try {
    const startTime = Date.now();
    const fileContent = req.file.buffer.toString('utf-8');
    const workflowResult = await runImportCausaliContabiliWorkflow(fileContent);
    const processingTime = Date.now() - startTime;

    // Usa il formatter standardizzato
    const standardResult = formatImportResult(
      workflowResult,
      'causali-contabili',
      req.file.originalname,
      req.file.size,
      processingTime
    );

    res.status(200).json(standardResult);
  } catch (error: unknown) {
    console.error("Errore durante l'importazione delle Causali Contabili:", error);
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    
    // Anche per gli errori, usa il formato standardizzato
    const standardResult = formatImportResult(
      { success: false, message: errorMessage },
      'causali-contabili',
      req.file?.originalname,
      req.file?.size
    );
    
    res.status(500).json(standardResult);
  }
} 