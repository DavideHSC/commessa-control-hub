import { Request, Response } from 'express';
import { runImportCondizioniPagamentoWorkflow } from '../workflows/importCondizioniPagamentoWorkflow';

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
    const result = await runImportCondizioniPagamentoWorkflow(fileContent);

    console.log('Importazione Condizioni di Pagamento completata:', result);
    res.json(result);
  } catch (error) {
    console.error('Errore durante importazione Condizioni di Pagamento:', error);
    res.status(500).json({ 
      error: 'Errore durante l\'importazione', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
} 