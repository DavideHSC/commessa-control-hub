/**
 * API v2 IMPORT ENDPOINTS
 * Endpoint consolidati per importazione enterprise-grade
 * 
 * Pattern: /api/v2/import/{entity}
 * Architettura: Handler → Workflow → Multi-Layer Processing
 */

import express from 'express';
import multer from 'multer';

// Import handlers esistenti
import { handlePianoDeiContiImportV2 } from '../../import-engine/orchestration/handlers/pianoDeiContiHandler';
import { handleCondizioniPagamentoImportV2 } from '../../import-engine/orchestration/handlers/condizioniPagamentoHandler';
import { handleCodiceIvaImport } from '../../import-engine/orchestration/handlers/codiceIvaHandler';
import { handleCausaleContabileImport } from '../../import-engine/orchestration/handlers/causaleContabileHandler';

// Import nuovo handler anagrafiche
import { handleAnagraficaImport, handleAnagraficaTemplateInfo } from '../../import-engine/orchestration/handlers/anagraficaHandler';

const router = express.Router();

// Configurazione Multer per upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accetta solo file .txt
    if (file.mimetype === 'text/plain' || file.originalname.toLowerCase().endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Solo file .txt sono supportati'));
    }
  }
});

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
router.post('/anagrafiche', upload.single('file'), handleAnagraficaImport);

/**
 * GET /api/v2/import/anagrafiche/template-info
 * Informazioni template Anagrafiche
 */
router.get('/anagrafiche/template-info', handleAnagraficaTemplateInfo);

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

/**
 * Error handler middleware
 */
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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