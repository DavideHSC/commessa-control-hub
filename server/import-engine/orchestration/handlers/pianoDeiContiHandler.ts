import { Request, Response } from 'express';
import { importPianoDeiContiWorkflow } from '../workflows/importPianoDeiContiWorkflow';

export async function handlePianoDeiContiImportV2(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'Nessun file caricato.' });
  }

  // Modern Pattern: Il file viene gestito in memoria.
  // Passiamo l'intero contenuto (buffer) come stringa al workflow.
  // L'encoding verrà gestito a valle se necessario.
  const fileContent = req.file.buffer.toString('latin1'); // latin1 è un encoding sicuro per i file legacy
  console.log(`[API V2] Ricevuto file per importazione Piano dei Conti: ${req.file.originalname}, size: ${req.file.size} bytes`);

  try {
    const result = await importPianoDeiContiWorkflow(fileContent);
    console.log('[API V2] Workflow completato. Invio risposta...');
    
    res.status(200).json({
      message: 'Importazione con nuovo motore completata!',
      ...result,
    });
  } catch (error: unknown) {
    console.error('[API V2] Errore critico durante il workflow:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    res.status(500).json({ 
      message: 'Errore interno del server durante l\'importazione.',
      error: errorMessage,
    });
  }
} 