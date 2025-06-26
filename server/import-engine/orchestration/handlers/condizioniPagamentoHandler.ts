import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { runImportCondizioniPagamentoWorkflow } from '../workflows/importCondizioniPagamentoWorkflow';

const prisma = new PrismaClient();

/**
 * Gestisce la richiesta HTTP per l'importazione delle Condizioni di Pagamento
 * utilizzando il nuovo motore v2.
 *
 * @param req L'oggetto richiesta di Express.
 * @param res L'oggetto risposta di Express.
 */
export async function handleCondizioniPagamentoImportV2(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: 'Nessun file caricato.' });
  }

  const filePath = req.file.path;
  console.log(`[API V2] Ricevuto file per importazione Condizioni di Pagamento: ${filePath}`);

  try {
    // 1. Recupera il template specifico dal database
    const template = await prisma.importTemplate.findUniqueOrThrow({
      where: { name: 'condizioni_pagamento' },
      include: { fieldDefinitions: true },
    });
    console.log(`[API V2] Template 'condizioni_pagamento' caricato.`);

    // 2. Esegue il workflow di importazione
    const result = await runImportCondizioniPagamentoWorkflow(filePath, template);
    console.log('[API V2] Workflow completato. Invio risposta...');
    
    // 3. Invia la risposta di successo
    res.status(200).json({
      message: 'Importazione Condizioni di Pagamento con nuovo motore completata!',
      result: result,
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