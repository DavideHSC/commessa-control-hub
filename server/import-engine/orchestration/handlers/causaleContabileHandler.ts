import { Request, Response } from 'express';
import { runImportCausaliContabiliWorkflow } from '../workflows/importCausaliContabiliWorkflow';

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
    const fileContent = req.file.buffer.toString('utf-8');
    const stats = await runImportCausaliContabiliWorkflow(fileContent);

    res.status(200).json({
      success: true,
      message: 'Importazione Causali Contabili completata.',
      stats: stats.stats,
      errors: stats.errors,
    });
  } catch (error: unknown) {
    console.error("Errore durante l'importazione delle Causali Contabili:", error);
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    res.status(500).json({ message: "Errore interno del server durante l'importazione.", error: errorMessage });
  }
} 