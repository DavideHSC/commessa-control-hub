import { Request, Response } from 'express';
import { importPianoDeiContiWorkflow } from '../workflows/importPianoDeiContiWorkflow';
import { importPianoDeiContiAziendaleWorkflow } from '../workflows/importPianoDeiContiAziendaleWorkflow';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Determina se il file è un piano dei conti standard o aziendale.
 * Ispeziona il nome del file per determinare se è di tipo standard o aziendale.
 * Cerca la presenza di "contiazi" o "contigen" nel nome del file.
 * 
 * @param fileName - Il nome del file originale.
 * @returns 'aziendale' o 'standard'.
 */
function determineFileType(fileName: string): 'aziendale' | 'standard' {
  const lowerCaseFileName = fileName.toLowerCase();

  if (lowerCaseFileName.includes('contiazi')) {
    console.log(`[Handler] Rilevato file di tipo: Aziendale (dal nome file: ${fileName})`);
    return 'aziendale';
  }
  
  // Default a standard se non è aziendale.
  console.log(`[Handler] Rilevato file di tipo: Standard (dal nome file: ${fileName})`);
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
  const fileName = req.file.originalname;
  console.log(`[API V2] Ricevuto file per importazione Piano dei Conti: ${fileName}, size: ${req.file.size} bytes`);

  try {
    const fileType = determineFileType(fileName);
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