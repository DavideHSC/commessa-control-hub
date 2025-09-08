import { Request, Response } from 'express';
import { runImportCondizioniPagamentoWorkflow } from '../workflows/importCondizioniPagamentoWorkflow.js';
import { formatImportResult } from '../../core/utils/resultFormatter.js';

/**
 * Gestisce la richiesta HTTP per l'importazione delle Condizioni di Pagamento
 * utilizzando il nuovo motore v2 (ARCHITETTURA MODERNA).
 *
 * @param req L'oggetto richiesta di Express.
 * @param res L'oggetto risposta di Express.
 */
export async function handleCondizioniPagamentoImportV2(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nessun file ricevuto' });
      return;
    }

    console.log('Ricevuto file per importazione Condizioni di Pagamento:', req.file.originalname);

    // Leggi il contenuto del file
    const fileContent = req.file.buffer.toString('latin1');

    // Esegui il workflow di importazione
    const startTime = Date.now();
    const workflowResult = await runImportCondizioniPagamentoWorkflow(fileContent);
    const processingTime = Date.now() - startTime;

    // Usa il formato standardizzato
    const standardResult = formatImportResult(
      workflowResult,
      'condizioni-pagamento',
      req.file.originalname,
      req.file.size,
      processingTime
    );

    console.log('Importazione Condizioni di Pagamento completata:', standardResult);
    res.json(standardResult);
  } catch (error) {
    console.error('Errore durante importazione Condizioni di Pagamento:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'importazione';
    const standardResult = formatImportResult(
      { success: false, message: errorMessage },
      'condizioni-pagamento',
      req.file?.originalname,
      req.file?.size
    );
    
    res.status(500).json(standardResult);
  }
} 