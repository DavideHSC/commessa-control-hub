import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { importCodiceIvaWorkflow } from '../workflows/importCodiceIvaWorkflow';

const prisma = new PrismaClient();
const TEMPLATE_NAME = 'codici_iva';

/**
 * HTTP handler for importing Codici IVA.
 * It validates the request, retrieves the import template, and triggers the workflow.
 */
export async function handleCodiceIvaImport(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ message: 'Nessun file caricato.' });
    return;
  }

  try {
    // Prima cerchiamo il template
    const template = await prisma.importTemplate.findFirst({
      where: { name: TEMPLATE_NAME },
    });

    if (!template) {
      res.status(404).json({ message: `Template '${TEMPLATE_NAME}' non trovato.` });
      return;
    }

    // Poi recuperiamo i fields separatamente
    const fields = await prisma.fieldDefinition.findMany({
      where: { templateId: template.id },
      orderBy: { start: 'asc' }
    });

    if (!fields || fields.length === 0) {
      res.status(404).json({ message: `Definizioni dei campi per il template '${TEMPLATE_NAME}' non trovate.` });
      return;
    }

    const fileContent = req.file.buffer.toString('utf-8');

    // Trigger the workflow, passing only the necessary data
    const stats = await importCodiceIvaWorkflow(fileContent, fields);

    res.status(200).json({
      message: 'Importazione Codici IVA completata con successo.',
      ...stats,
    });
  } catch (error: unknown) {
    console.error("Errore durante l'importazione dei Codici IVA:", error);
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    res.status(500).json({ message: 'Errore interno del server durante l\'importazione.', error: errorMessage });
  }
} 