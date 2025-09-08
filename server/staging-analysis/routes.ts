import express from 'express';
import { AnagraficaResolver } from './services/AnagraficaResolver.js';
import { RigheAggregator } from './services/RigheAggregator.js';
import { AllocationCalculator } from './services/AllocationCalculator.js';
import { UserPresentationMapper } from './services/UserPresentationMapper.js';
import { AllocationWorkflowTester } from './services/AllocationWorkflowTester.js';
import { BusinessValidationTester } from './services/BusinessValidationTester.js';
import { AnagrafichePreviewService } from './services/AnagrafichePreviewService.js';
import { MovimentiContabiliService } from './services/MovimentiContabiliService.js';

const router = express.Router();
import { PrismaClient } from '@prisma/client';


// Sezione A: Risoluzione Anagrafica
router.get('/anagrafiche-resolution', async (_req, res) => {
  try {
    const resolver = new AnagraficaResolver();
    const result = await resolver.resolveAnagrafiche();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in anagrafiche-resolution:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve anagrafiche' });
  }
});

// Sezione B: Aggregazione Righe Contabili  
router.get('/righe-aggregation', async (_req, res) => {
  try {
    const aggregator = new RigheAggregator();
    const result = await aggregator.aggregateRighe();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in righe-aggregation:', error);
    res.status(500).json({ success: false, error: 'Failed to aggregate righe' });
  }
});

// Sezione C: Calcolo Stato Allocazione
router.get('/allocation-status', async (_req, res) => {
  try {
    const calculator = new AllocationCalculator();
    const result = await calculator.calculateAllocationStatus();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in allocation-status:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate allocation status' });
  }
});

// Sezione D: Presentazione Utente
router.get('/user-movements', async (_req, res) => {
  try {
    const mapper = new UserPresentationMapper();
    const result = await mapper.mapToUserMovements();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in user-movements:', error);
    res.status(500).json({ success: false, error: 'Failed to map user movements' });
  }
});

// Sezione E: Test Workflow Allocazione
router.post('/test-allocation-workflow', async (req, res) => {
  try {
    const tester = new AllocationWorkflowTester();
    const result = await tester.testAllocationWorkflow(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in test-allocation-workflow:', error);
    res.status(500).json({ success: false, error: 'Failed to test allocation workflow' });
  }
});

// Sezione F: Test Validazione Business
router.post('/test-business-validations', async (req, res) => {
  try {
    const tester = new BusinessValidationTester();
    const result = await tester.testBusinessValidations(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in test-business-validations:', error);
    res.status(500).json({ success: false, error: 'Failed to test business validations' });
  }
});

// NUOVE SEZIONI: Suggerimenti automatici di allocazione

// Sezione G: Genera suggerimenti automatici
router.get('/auto-allocation-suggestions', async (_req, res) => {
  try {
    const calculator = new AllocationCalculator();
    const result = await calculator.generateAutoAllocationSuggestions();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in auto-allocation-suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to generate auto allocation suggestions' });
  }
});

// Sezione H: Applica suggerimenti selezionati (test virtuale)
router.post('/apply-allocation-suggestions', async (req, res) => {
  try {
    const { suggestionIds, minConfidenza } = req.body;
    const calculator = new AllocationCalculator();
    const result = await calculator.applyAllocationSuggestions(suggestionIds || [], minConfidenza || 70);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in apply-allocation-suggestions:', error);
    res.status(500).json({ success: false, error: 'Failed to apply allocation suggestions' });
  }
});

// NUOVO ENDPOINT: Preview Import Anagrafiche
router.get('/anagrafiche-preview', async (_req, res) => {
  try {
    const previewService = new AnagrafichePreviewService();
    const result = await previewService.getAnagrafichePreview();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in anagrafiche-preview:', error);
    res.status(500).json({ success: false, error: 'Failed to generate anagrafiche preview' });
  }
});

// Sezione G: Movimenti Contabili Completi
router.get('/movimenti-contabili', async (req, res) => {
  try {
    const {
      dataDa,
      dataA,
      soggetto,
      stato,
      page,
      limit
    } = req.query;

    // Validazione parametri
    const filters: any = {};
    
    if (dataDa && typeof dataDa === 'string') {
      // Validate YYYY-MM-DD format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataDa)) {
        return res.status(400).json({ 
          success: false, 
          error: 'dataDa must be in YYYY-MM-DD format' 
        });
      }
      filters.dataDa = dataDa;
    }
    
    if (dataA && typeof dataA === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataA)) {
        return res.status(400).json({ 
          success: false, 
          error: 'dataA must be in YYYY-MM-DD format' 
        });
      }
      filters.dataA = dataA;
    }
    
    if (soggetto && typeof soggetto === 'string') {
      filters.soggetto = soggetto.trim();
    }
    
    if (stato && typeof stato === 'string') {
      if (!['D', 'P', 'V', 'ALL'].includes(stato)) {
        return res.status(400).json({ 
          success: false, 
          error: 'stato must be one of: D, P, V, ALL' 
        });
      }
      filters.stato = stato;
    }
    
    if (page) {
      const pageNum = parseInt(page as string);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ 
          success: false, 
          error: 'page must be a positive integer' 
        });
      }
      filters.page = pageNum;
    }
    
    if (limit) {
      const limitNum = parseInt(limit as string);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({ 
          success: false, 
          error: 'limit must be between 1 and 100' 
        });
      }
      filters.limit = limitNum;
    }

    const movimentiService = new MovimentiContabiliService();
    const result = await movimentiService.getMovimentiContabili(filters);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in movimenti-contabili:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch movimenti contabili' });
  }
});

// Sezione E: Test Workflow Allocazione  
router.get('/allocation-workflow', async (req, res) => {
  try {
    const {
      dataDa,
      dataA,
      soggetto,
      stato,
      page,
      limit,
      soloAllocabili,
      statoAllocazione,
      hasAllocazioniStaging,
      contoRilevante
    } = req.query;

    // Validazione parametri base (riusa logica esistente)
    const filters: any = {};
    
    if (dataDa && typeof dataDa === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataDa)) {
        return res.status(400).json({ 
          success: false, 
          error: 'dataDa must be in YYYY-MM-DD format' 
        });
      }
      filters.dataDa = dataDa;
    }
    
    if (dataA && typeof dataA === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataA)) {
        return res.status(400).json({ 
          success: false, 
          error: 'dataA must be in YYYY-MM-DD format' 
        });
      }
      filters.dataA = dataA;
    }
    
    if (soggetto && typeof soggetto === 'string') {
      filters.soggetto = soggetto.trim();
    }
    
    if (stato && typeof stato === 'string') {
      if (!['D', 'P', 'V', 'ALL'].includes(stato)) {
        return res.status(400).json({ 
          success: false, 
          error: 'stato must be one of: D, P, V, ALL' 
        });
      }
      filters.stato = stato;
    }
    
    if (page) {
      const pageNum = parseInt(page as string);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ 
          success: false, 
          error: 'page must be a positive integer' 
        });
      }
      filters.page = pageNum;
    }
    
    if (limit) {
      const limitNum = parseInt(limit as string);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({ 
          success: false, 
          error: 'limit must be between 1 and 100' 
        });
      }
      filters.limit = limitNum;
    }

    // Parametri specifici allocation workflow
    if (soloAllocabili === 'true') {
      filters.soloAllocabili = true;
    }
    
    if (statoAllocazione && typeof statoAllocazione === 'string') {
      if (!['non_allocato', 'parzialmente_allocato', 'completamente_allocato'].includes(statoAllocazione)) {
        return res.status(400).json({ 
          success: false, 
          error: 'statoAllocazione must be one of: non_allocato, parzialmente_allocato, completamente_allocato' 
        });
      }
      filters.statoAllocazione = statoAllocazione;
    }

    if (hasAllocazioniStaging === 'true') {
      filters.hasAllocazioniStaging = true;
    }

    if (contoRilevante === 'true') {
      filters.contoRilevante = true;
    }

    const { AllocationWorkflowService } = await import('./services/AllocationWorkflowService.js');
    const allocationService = new AllocationWorkflowService();
    const result = await allocationService.getMovimentiAllocabili(filters);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Error in allocation-workflow:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch allocation workflow data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Test allocazioni virtuali
router.post('/allocation-workflow/test', async (req, res) => {
  try {
    const { movimentoId, allocazioniVirtuali, modalitaTest } = req.body;

    // Validazione input
    if (!movimentoId || typeof movimentoId !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'movimentoId is required and must be a string' 
      });
    }

    if (!allocazioniVirtuali || !Array.isArray(allocazioniVirtuali)) {
      return res.status(400).json({ 
        success: false, 
        error: 'allocazioniVirtuali is required and must be an array' 
      });
    }

    if (modalitaTest && !['VALIDATION_ONLY', 'PREVIEW_SCRITTURE', 'IMPACT_ANALYSIS'].includes(modalitaTest)) {
      return res.status(400).json({ 
        success: false, 
        error: 'modalitaTest must be one of: VALIDATION_ONLY, PREVIEW_SCRITTURE, IMPACT_ANALYSIS' 
      });
    }

    const testRequest = {
      movimentoId,
      allocazioniVirtuali,
      modalitaTest: modalitaTest || 'VALIDATION_ONLY'
    };

    const { AllocationWorkflowService } = await import('./services/AllocationWorkflowService.js');
    const allocationService = new AllocationWorkflowService();
    const result = await allocationService.testAllocationWorkflow(testRequest);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in allocation-workflow test:', error);
    res.status(500).json({ success: false, error: 'Failed to test allocation workflow' });
  }
});

export default router;