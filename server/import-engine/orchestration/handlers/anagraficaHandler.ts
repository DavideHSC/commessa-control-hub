/**
 * ANAGRAFICA HANDLER
 * Handler HTTP per importazione anagrafiche A_CLIFOR.TXT
 * 
 * Endpoint: POST /api/v2/import/anagrafiche
 * Pattern: Multipart Upload → Workflow → Response
 */

import { Request, Response } from 'express';
import { executeAnagraficheImportWorkflow } from '../workflows/importAnagraficheWorkflow';

export interface AnagraficaImportRequest {
  templateName?: string;
}

/**
 * Handler per importazione anagrafiche via API v2
 */
export async function handleAnagraficaImport(req: Request, res: Response): Promise<void> {
  console.log('🚀 POST /api/v2/import/anagrafiche - Inizio importazione anagrafiche');
  
  try {
    // Validazione file upload
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'File non fornito. È richiesto un file A_CLIFOR.TXT.',
        error: 'MISSING_FILE'
      });
      return;
    }
    
    // Validazione tipo file
    const allowedExtensions = ['.txt', '.TXT'];
    const fileExtension = req.file.originalname.substring(req.file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      res.status(400).json({
        success: false,
        message: `Tipo file non supportato. Estensioni ammesse: ${allowedExtensions.join(', ')}`,
        error: 'INVALID_FILE_TYPE'
      });
      return;
    }
    
    // Estrazione parametri richiesta
    const { templateName = 'anagrafica_clifor' }: AnagraficaImportRequest = req.body;
    
    console.log(`📄 File: ${req.file.originalname} (${req.file.size} bytes)`);
    console.log(`🎯 Template: ${templateName}`);
    
    // Conversione buffer a string
    const fileContent = req.file.buffer.toString('utf-8');
    
    if (fileContent.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'File vuoto o non leggibile.',
        error: 'EMPTY_FILE'
      });
      return;
    }
    
    console.log(`📊 Dimensione contenuto: ${fileContent.length} caratteri`);
    
    // **ESECUZIONE WORKFLOW**
    const result = await executeAnagraficheImportWorkflow(fileContent, templateName);
    
    // **RESPONSE FINALE**
    if (result.success) {
      console.log('✅ Import anagrafiche completato con successo');
      
      // La UI si aspetta un formato semplice con createdRecords e updatedRecords
      res.status(200).json({
        success: true,
        message: 'Importazione anagrafiche completata con successo',
        createdRecords: result.stats.createdRecords,
        updatedRecords: result.stats.updatedRecords,
        // Dati diagnostici estesi per il logging, non usati direttamente dalla UI base
        details: {
          parsing: {
            totalRecords: result.stats.totalRecords,
            successfulRecords: result.stats.successfulRecords,
            errorRecords: result.stats.errorRecords
          },
          transformation: result.anagraficheStats,
          validationErrors: result.errors
        }
      });
    } else {
      console.error('❌ Import anagrafiche fallito:', result.message);
      
      res.status(422).json({
        success: false,
        message: result.message,
        error: 'IMPORT_FAILED',
        data: {
          parsing: {
            totalRecords: result.stats.totalRecords,
            successfulRecords: result.stats.successfulRecords,
            errorRecords: result.stats.errorRecords,
            warnings: result.stats.warnings.length,
            errors: result.stats.errors.length
          },
          validationErrors: result.errors
        }
      });
    }
    
  } catch (error) {
    console.error('💥 Errore interno durante import anagrafiche:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server durante l\'importazione',
      error: 'INTERNAL_SERVER_ERROR',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Handler per informazioni sui template anagrafiche
 */
export async function handleAnagraficaTemplateInfo(req: Request, res: Response): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      message: 'Informazioni template anagrafiche',
      data: {
        templateName: 'anagrafica_clifor',
        fileFormat: 'A_CLIFOR.TXT',
        description: 'Anagrafiche Clienti e Fornitori',
        expectedLength: 338,
        encoding: ['utf-8', 'latin1'],
        structure: {
          totalFields: 38,
          keyFields: ['CODICE_UNIVOCO', 'TIPO_CONTO', 'DENOMINAZIONE'],
          businessLogic: {
            tipiConto: {
              'C': 'Solo Cliente',
              'F': 'Solo Fornitore', 
              'E': 'Entrambi (Cliente e Fornitore)'
            },
            tipiSoggetto: {
              '0': 'Persona Fisica',
              '1': 'Soggetto Diverso (Società/Ente)'
            }
          }
        },
        outputTables: ['Cliente', 'Fornitore'],
        notes: [
          'Record con TIPO_CONTO="E" vengono duplicati in entrambe le tabelle',
          'Validazione automatica CF e P.IVA',
          'Decodifica automatica codici legacy',
          'Gestione date formato GGMMAAAA'
        ]
      }
    });
  } catch (error) {
    console.error('💥 Errore durante recupero info template:', error);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
} 