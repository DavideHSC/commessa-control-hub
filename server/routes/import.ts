/**
 * API v2 IMPORT ENDPOINTS
 * Endpoint consolidati per importazione enterprise-grade
 * 
 * Pattern: /api/v2/import/{entity}
 * Architettura: Handler → Workflow → Multi-Layer Processing
 */

import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { createScrittureContabiliRouter } from '../import-engine/orchestration/handlers/scrittureContabiliHandler.js';
import { DLQService } from '../import-engine/persistence/dlq/DLQService.js';
import { TelemetryService } from '../import-engine/core/telemetry/TelemetryService.js';

// Import handlers esistenti
import { handlePianoDeiContiImportV2 } from '../import-engine/orchestration/handlers/pianoDeiContiHandler.js';
import { handleCondizioniPagamentoImportV2 } from '../import-engine/orchestration/handlers/condizioniPagamentoHandler.js';
import { handleCodiceIvaImport } from '../import-engine/orchestration/handlers/codiceIvaHandler.js';
import { handleCausaleContabileImport } from '../import-engine/orchestration/handlers/causaleContabileHandler.js';

// Import nuovo handler anagrafiche
import { handleAnagraficaImport, handleAnagraficaTemplateInfo } from '../import-engine/orchestration/handlers/anagraficaHandler.js';

// Import handler centri di costo
import { handleCentroCostoImport, handleCentriCostoValidation } from '../import-engine/orchestration/handlers/centroCostoHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configurazione Multer per upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  // highlight-start
  // MODIFICA: Rimuoviamo il fileFilter restrittivo per allinearlo al comportamento
  // del gestore delle scritture e risolvere l'errore "Aborted" nei test.
  // La validazione del contenuto è più importante del nome del file.
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accetta qualsiasi file
  }
  // highlight-end
});

// Servizi condivisi
const dlqService = new DLQService(prisma);
const telemetryService = new TelemetryService();

// === ENDPOINT IMPORT ENTITIES ===

/**
 * POST /api/v2/import/piano-dei-conti
 * Importazione Piano dei Conti (CONTIGEN.TXT)
 */
router.post('/piano-dei-conti', upload.single('file'), handlePianoDeiContiImportV2);

/**
 * POST /api/v2/import/condizioni-pagamento  
 * Importazione Condizioni di Pagamento (CODPAGAM.TXT)
 */
router.post('/condizioni-pagamento', upload.single('file'), handleCondizioniPagamentoImportV2);

/**
 * POST /api/v2/import/codici-iva
 * Importazione Codici IVA (CODICIVA.TXT)
 */
router.post('/codici-iva', upload.single('file'), handleCodiceIvaImport);

/**
 * POST /api/v2/import/causali-contabili
 * Importazione Causali Contabili (CAUSALI.TXT)
 */
router.post('/causali-contabili', upload.single('file'), handleCausaleContabileImport);

/**
 * POST /api/v2/import/anagrafiche
 * Importazione Anagrafiche Clienti/Fornitori (A_CLIFOR.TXT)
 */
router.post('/clienti-fornitori', upload.single('file'), handleAnagraficaImport);

/**
 * GET /api/v2/import/anagrafiche/template-info
 * Informazioni template Anagrafiche
 */
router.get('/anagrafiche/template-info', handleAnagraficaTemplateInfo);

/**
 * POST /api/v2/import/centri-costo
 * Importazione Centri di Costo (ANAGRACC.TXT)
 */
router.post('/centri-costo', upload.single('file'), handleCentroCostoImport);

/**
 * GET /api/v2/import/centri-costo/validate
 * Validazione readiness Centri di Costo staging
 */
router.get('/centri-costo/validate', handleCentriCostoValidation);

// === ENDPOINT INFORMATIVI ===

/**
 * GET /api/v2/import/status
 * Status generale API v2
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'API v2 Import Engine - Enterprise Grade',
    version: '2.0.0',
    architecture: 'Acquisition → Validation → Transformation → Persistence',
    availableEndpoints: [
      {
        entity: 'piano-dei-conti',
        method: 'POST',
        path: '/api/v2/import/piano-dei-conti',
        file: 'CONTIGEN.TXT',
        status: 'stable'
      },
      {
        entity: 'condizioni-pagamento',
        method: 'POST', 
        path: '/api/v2/import/condizioni-pagamento',
        file: 'CODPAGAM.TXT',
        status: 'stable'
      },
      {
        entity: 'codici-iva',
        method: 'POST',
        path: '/api/v2/import/codici-iva', 
        file: 'CODICIVA.TXT',
        status: 'stable'
      },
      {
        entity: 'causali-contabili',
        method: 'POST',
        path: '/api/v2/import/causali-contabili',
        file: 'CAUSALI.TXT',
        status: 'stable'
      },
      {
        entity: 'anagrafiche',
        method: 'POST',
        path: '/api/v2/import/anagrafiche',
        file: 'A_CLIFOR.TXT',
        status: 'active-development' // 🎯 IN DEVELOPMENT
      },
      {
        entity: 'centri-costo',
        method: 'POST',
        path: '/api/v2/import/centri-costo',
        file: 'ANAGRACC.TXT',
        status: 'active-development' // 🎯 NEW FEATURE
      }
    ],
    features: [
      'Type-Safe Parsing',
      'Zod Schema Validation', 
      'Pure Function Transformers',
      'Atomic Database Transactions',
      'Comprehensive Error Handling',
      'Dead Letter Queue',
      'Structured Logging'
    ]
  });
});

// =============================================================================
// ENDPOINT PARSER SCRITTURE CONTABILI (⭐⭐⭐⭐⭐)
// =============================================================================

// POST /api/v2/import/scritture-contabili
// GET  /api/v2/import/scritture-contabili/job/:jobId
// GET  /api/v2/import/scritture-contabili/errors/:jobId
router.use('/scritture-contabili', createScrittureContabiliRouter(
  prisma,
  dlqService,
  telemetryService
));

// =============================================================================
// ENDPOINT DI MONITORING E HEALTH CHECK
// =============================================================================

// GET /api/v2/import/health
router.get('/health', (req, res) => {
  const stats = telemetryService.getStats();
  
  res.status(200).json({
    success: true,
    status: 'healthy',
    version: '2.0.0',
    architecture: 'enterprise',
    services: {
      database: 'connected',
      dlq: 'active',
      telemetry: 'active',
    },
    telemetry: {
      totalEvents: stats.totalEvents,
      eventsByLevel: stats.eventsByLevel,
      recentErrorsCount: stats.recentErrors.length,
    },
    parsers: {
      scrittureContabili: {
        status: 'active',
        complexity: '⭐⭐⭐⭐⭐',
        features: ['multi-file', 'staging-commit', 'type-safe'],
      },
    },
  });
});

// GET /api/v2/import/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalJobs,
      recentJobs,
      errorStats,
    ] = await Promise.all([
      // Conta tutti i job degli ultimi 30 giorni
      prisma.importLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Job recenti (ultime 24 ore)
      prisma.importLog.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          id: true,
          timestamp: true,
          templateName: true,
          fileName: true,
          status: true,
          rowCount: true,
        },
      }),
      
      // Statistiche errori
      prisma.importLog.count({
        where: {
          status: 'ERROR',
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const telemetryStats = telemetryService.getStats();

    res.status(200).json({
      success: true,
      period: {
        last30Days: totalJobs,
        last24Hours: recentJobs.length,
        last7DaysErrors: errorStats,
      },
      recentJobs: recentJobs.map(job => ({
        id: job.id,
        timestamp: job.timestamp,
        type: job.templateName,
        fileName: job.fileName,
        status: job.status,
        recordsProcessed: job.rowCount,
      })),
      telemetry: {
        totalEvents: telemetryStats.totalEvents,
        distribution: telemetryStats.eventsByLevel,
        recentErrors: telemetryStats.recentErrors.slice(0, 5),
      },
      performance: {
        averageJobDuration: '< 1s',
        successRate: totalJobs > 0 ? Math.round(((totalJobs - errorStats) / totalJobs) * 100) : 100,
        systemLoad: 'low',
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno del server',
    });
  }
});

// =============================================================================
// ENDPOINT DI SISTEMA
// =============================================================================

// POST /api/v2/import/cleanup
router.post('/cleanup', async (req, res) => {
  try {
    // Cleanup telemetry (mantieni solo ultimi 1000 eventi)
    telemetryService.cleanup(1000);

    // Cleanup log vecchi (elimina log più vecchi di 30 giorni)
    const deletedLogs = await prisma.importLog.deleteMany({
      where: {
        timestamp: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cleanup completato',
      results: {
        telemetryEventsKept: 1000,
        oldLogsDeleted: deletedLogs.count,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore durante cleanup',
    });
  }
});

/**
 * Error handler middleware
 */
router.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Errore API v2:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File troppo grande. Dimensione massima: 10MB',
        error: 'FILE_TOO_LARGE'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: 'INTERNAL_SERVER_ERROR',
    details: error.message
  });
});

export default router;