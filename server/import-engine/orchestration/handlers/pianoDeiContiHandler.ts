import { Request, Response } from 'express';
import { importPianoDeiContiWorkflow } from '../workflows/importPianoDeiContiWorkflow';

export async function handlePianoDeiContiImportV2(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'Nessun file caricato.' });
  }

  const filePath = req.file.path;
  console.log(`[API V2] Ricevuto file per importazione Piano dei Conti: ${filePath}`);

  try {
    const result = await importPianoDeiContiWorkflow(filePath);
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