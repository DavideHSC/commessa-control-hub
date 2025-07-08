import { Request, Response } from 'express';
import { importPianoDeiContiWorkflow } from '../workflows/importPianoDeiContiWorkflow';
import { importPianoDeiContiAziendaleWorkflow } from '../workflows/importPianoDeiContiAziendaleWorkflow';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Determina se il file è un piano dei conti standard o aziendale.
 * Ispeziona la prima riga del file per la presenza di un codice fiscale
 * nella posizione attesa per i file CONTIAZI.
 * 
 * @param fileContent - Il contenuto del file come stringa.
 * @returns 'aziendale' o 'standard'.
 */
function determineFileType(fileContent: string): 'aziendale' | 'standard' {
  const firstLine = fileContent.split('\\n')[0];
  if (!firstLine) return 'standard'; // Se vuoto, default a standard

  // Tracciato CONTIAZI: Codice Fiscale da posizione 4 a 19.
  // Se questo campo non è vuoto, è quasi certamente un file aziendale.
  if (firstLine.length >= 19 && firstLine.substring(3, 19).trim() !== '') {
    console.log('[Handler] Rilevato file di tipo: Aziendale');
    return 'aziendale';
  }
  
  console.log('[Handler] Rilevato file di tipo: Standard');
  return 'standard';
}


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
    const fileType = determineFileType(fileContent);
    let result;

    if (fileType === 'aziendale') {
      result = await importPianoDeiContiAziendaleWorkflow(fileContent);
    } else {
      result = await importPianoDeiContiWorkflow(fileContent);
    }

    console.log('[API V2] Workflow completato. Invio risposta...');
    
    res.status(200).json({
      message: `Importazione con nuovo motore (tipo: ${fileType}) completata!`,
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