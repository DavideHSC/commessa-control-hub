import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { ImportScrittureContabiliWorkflow, ScrittureContabiliFiles } from '../workflows/importScrittureContabiliWorkflow.js';
import { DLQService } from '../../persistence/dlq/DLQService.js';
import { TelemetryService } from '../../core/telemetry/TelemetryService.js';
import { formatImportResult } from '../../core/utils/resultFormatter.js';

// =============================================================================
// PARSER 6: SCRITTURE CONTABILI - HTTP HANDLER
// =============================================================================
// Espone il parser più complesso del sistema tramite API REST enterprise-grade.
// Gestisce upload multi-file, orchestrazione workflow e response strutturate.
//
// ENDPOINT: POST /api/v2/import/scritture-contabili
// 
// FEATURES:
// - Upload multi-file con validazione
// - Response time ottimizzati
// - Error handling completo
// - Tracking job real-time
// =============================================================================

export class ScrittureContabiliHandler {
  private workflow: ImportScrittureContabiliWorkflow;
  private upload: multer.Multer;

  constructor(
    private prisma: PrismaClient,
    private dlqService: DLQService,
    private telemetryService: TelemetryService
  ) {
    this.workflow = new ImportScrittureContabiliWorkflow(
      prisma,
      dlqService,
      telemetryService
    );

    // Configurazione multer per upload multi-file
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file
        files: 4, // Massimo 4 file
      },
      fileFilter: (req, file, cb) => {
        // Accetta tutti i file - i file negli uploads non hanno estensione/mimetype
        cb(null, true);
      },
    });
  }

  /**
   * Crea il router Express con tutti gli endpoint
   */
  createRouter(): express.Router {
    const router = express.Router();

    // POST /api/v2/import/scritture-contabili
    router.post('/', this.upload.any(), this.importScrittureContabili.bind(this));
    
    // GET /api/v2/import/scritture-contabili/job/:jobId
    router.get('/job/:jobId', this.getJobStatus.bind(this));
    
    // GET /api/v2/import/scritture-contabili/errors/:jobId
    router.get('/errors/:jobId', this.getJobErrors.bind(this));

    return router;
  }

  /**
   * Handler principale per l'importazione delle scritture contabili
   */
  private async importScrittureContabili(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 DEBUG HANDLER: Files ricevuti:', req.files ? (req.files as Express.Multer.File[]).length : 0);
      if (req.files) {
        (req.files as Express.Multer.File[]).forEach(file => {
          console.log(`🔍 DEBUG HANDLER: File "${file.fieldname}" - ${file.size} bytes`);
        });
      }
      
      // Valida presenza file
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Nessun file caricato. Sono richiesti almeno i campi: pntesta e pnrigcon.',
        });
        return;
      }

      const files = req.files as Express.Multer.File[];

      // Organizza file per fieldname (il nome del campo nel form)
      const fileMap: Record<string, Express.Multer.File> = {};
      files.forEach(file => {
        fileMap[file.fieldname] = file;
      });

      // Valida file obbligatori
      const requiredFiles = ['pntesta', 'pnrigcon'];
      const missingFiles = requiredFiles.filter(fieldName => !fileMap[fieldName]);
      
      if (missingFiles.length > 0) {
        res.status(400).json({
          success: false,
          error: `File obbligatori mancanti: ${missingFiles.join(', ')}. Usa i nomi: pntesta, pnrigcon, pnrigiva, movanac`,
        });
        return;
      }

      // Prepara struttura file per il workflow
      const scrittureFiles: ScrittureContabiliFiles = {
        pnTesta: fileMap['pntesta'].buffer,
        pnRigCon: fileMap['pnrigcon'].buffer,
        pnRigIva: fileMap['pnrigiva']?.buffer,
        movAnac: fileMap['movanac']?.buffer,
      };

      // Esegui il workflow
      console.log('🚨 HANDLER: Eseguendo workflow...');
      const startTime = Date.now();
      const result = await this.workflow.execute(scrittureFiles);
      const duration = Date.now() - startTime;

      // Response di successo con formato standardizzato
      const standardResult = formatImportResult(
        {
          ...result,
          stats: {
            ...result.stats,
            processingTime: duration,
            performanceMetrics: {
              recordsPerSecond: Math.round((result.stats.testateStaging / duration) * 1000),
              averageTimePerRecord: Math.round(duration / (result.stats.testateStaging || 1)),
            },
          },
        },
        'scritture-contabili',
        'Multiple files', // Scritture contabili usa file multipli
        undefined,
        duration
      );

      // Mantieni la compatibilità con gli endpoint specifici
      // IMPORTANTE: Il frontend si aspetta jobId a livello root per le scritture contabili
      const responseWithEndpoints = {
        success: true,
        jobId: result.jobId, // ✅ jobId a livello root per compatibilità frontend
        message: standardResult.message,
        endpoints: {
          jobStatus: `/api/v2/import/scritture-contabili/job/${result.jobId}`,
          errors: result.stats.erroriValidazione > 0 
            ? `/api/v2/import/scritture-contabili/errors/${result.jobId}` 
            : null,
        },
        // Includi anche i dati standardizzati per completezza
        standardResult: standardResult
      };

      res.status(200).json(responseWithEndpoints);

    } catch (error) {
      console.error('Errore durante importazione scritture contabili:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Errore interno del server';
      
      // Per errori, restituisci formato compatibile con frontend
      res.status(500).json({
        success: false,
        message: errorMessage,
        jobId: null,
        endpoints: {}
      });
    }
  }

  /**
   * Recupera lo stato di un job di importazione
   */
  private async getJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      // Recupera eventi di telemetria per il job
      const events = this.telemetryService.getEventsForJob(jobId);
      
      if (events.length === 0) {
        res.status(404).json({
          success: false,
          error: `Job ${jobId} non trovato`,
        });
        return;
      }

      // Analizza gli eventi per determinare lo stato
      const lastEvent = events[events.length - 1];
      const startEvent = events.find(e => e.message.includes('started'));
      const endEvent = events.find(e => e.message.includes('completed') || e.message.includes('failed'));

      const isCompleted = endEvent && endEvent.message.includes('completed');
      const isFailed = endEvent && endEvent.message.includes('failed');

      // Costruisci response base
      const response: any = {
        success: true,
        jobId,
        status: isCompleted ? 'completed' : (isFailed ? 'failed' : 'running'),
        startTime: startEvent?.timestamp,
        endTime: endEvent?.timestamp,
        duration: endEvent && startEvent 
          ? endEvent.timestamp.getTime() - startEvent.timestamp.getTime()
          : undefined,
        events: events.map(event => ({
          timestamp: event.timestamp,
          level: event.level,
          message: event.message,
          metadata: event.metadata,
        })),
      };

      // Se il job è completato, aggiungi il report dettagliato
      if (isCompleted) {
        const report = await this.generateCompletionReport(jobId);
        response.report = report;
      }

      res.status(200).json(response);

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno del server',
      });
    }
  }

  /**
   * Genera un report dettagliato per un job completato
   */
  private async generateCompletionReport(jobId: string) {
    try {
      // Recupera statistiche dalle tabelle di staging
      const [
        testateCount,
        righeContabiliCount,
        righeIvaCount,
        allocazioniCount,
        stagingConti,
        stagingAnagrafiche
      ] = await Promise.all([
        this.prisma.stagingTestata.count(),
        this.prisma.stagingRigaContabile.count(),
        this.prisma.stagingRigaIva.count(),
        this.prisma.stagingAllocazione.count(),
        this.prisma.stagingConto.findMany({
          take: 10,
          select: { id: true, codice: true, descrizione: true }
        }),
        this.prisma.stagingAnagrafica.findMany({
          take: 10,
          select: { id: true, codiceAnagrafica: true, nome: true, cognome: true }
        })
      ]);

      // Mostra tutte le entità create (non abbiamo più il flag isPlaceholder nelle tabelle staging)
      const contiRecenti = stagingConti;
      const anagraficheRecenti = stagingAnagrafiche;

      return {
        stats: {
          filesProcessed: 4, // Sempre 4 per scritture contabili
          testateImportate: testateCount,
          righeContabiliImportate: righeContabiliCount,
          righeIvaImportate: righeIvaCount,
          allocazioniImportate: allocazioniCount,
          totalRecords: testateCount + righeContabiliCount + righeIvaCount + allocazioniCount,
        },
        entitiesCreated: {
          contiCreati: {
            count: contiRecenti.length,
            sample: contiRecenti.slice(0, 5).map(c => ({
              id: c.id,
              codice: c.codice || 'N/A',
              nome: c.descrizione || 'Senza descrizione'
            }))
          },
          anagraficheCreati: {
            count: anagraficheRecenti.length,
            sample: anagraficheRecenti.slice(0, 5).map(a => ({
              id: a.id,
              codice: a.codiceAnagrafica || 'N/A',
              nome: `${a.nome || ''} ${a.cognome || ''}`.trim() || 'Senza nome'
            }))
          }
        }
      };

    } catch (error) {
      console.error('Errore nella generazione del report:', error);
      return {
        stats: { error: 'Impossibile recuperare le statistiche' },
        entitiesCreated: {}
      };
    }
  }

  /**
   * Recupera gli errori di un job di importazione
   */
  private async getJobErrors(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 50;

      // Recupera errori dalla DLQ
      const errorsResult = await this.dlqService.getErrorsForAnalysis(page, pageSize, {
        jobId,
      });

      res.status(200).json({
        success: true,
        jobId,
        errors: errorsResult.errors.map(error => ({
          id: error.id,
          timestamp: error.timestamp,
          fileName: error.fileName,
          details: JSON.parse(error.details || '{}'),
        })),
        pagination: errorsResult.pagination,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno del server',
      });
    }
  }
}

/**
 * Factory function per creare il router delle scritture contabili
 */
export function createScrittureContabiliRouter(
  prisma: PrismaClient,
  dlqService: DLQService,
  telemetryService: TelemetryService
): express.Router {
  const handler = new ScrittureContabiliHandler(prisma, dlqService, telemetryService);
  return handler.createRouter();
} 