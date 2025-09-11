import express from 'express';
import { AnagraficaResolver } from './services/AnagraficaResolver.js';
import { AllocationCalculator } from './services/AllocationCalculator.js';
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

// Sezione B: Calcolo Stato Allocazione
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

// Sezione C: Test Workflow Allocazione
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

// Sezione D: Test Validazione Business
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

// Sezione E: Genera suggerimenti automatici
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

// Sezione F: Applica suggerimenti selezionati (test virtuale)
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

// Sezione A: Movimenti Contabili Completi
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

// Sezione B: Test Workflow Allocazione  
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

/**
 * NUOVO ENDPOINT: Applica allocazioni virtuali al database
 * POST /api/centro-controllo/allocation-workflow/apply
 * 
 * COMPLETAMENTO CRITICO: Step finale workflow che persistisce allocazioni
 * Risolve CRITICITÀ 4: Workflow incompleto mancante di persistenza
 */
router.post('/allocation-workflow/apply', async (req, res) => {
  try {
    console.log('🎯 Apply Virtual Allocations endpoint called');
    
    const { movimentoId, allocazioniVirtuali, userId, note } = req.body;
    
    // Validazione input base
    if (!movimentoId || !Array.isArray(allocazioniVirtuali) || allocazioniVirtuali.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'movimentoId e allocazioniVirtuali sono richiesti',
        details: {
          movimentoIdPresent: !!movimentoId,
          allocazioniCount: allocazioniVirtuali?.length || 0
        }
      });
    }
    
    // Validazione struttura allocazioni
    const invalidAllocations = allocazioniVirtuali.filter((alloc: any) => 
      !alloc.commessaId || typeof alloc.importo !== 'number' || alloc.importo <= 0
    );
    
    if (invalidAllocations.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Allocazioni non valide: commessaId e importo > 0 sono richiesti',
        invalidCount: invalidAllocations.length,
        invalidAllocations: invalidAllocations.map((alloc: any, index: number) => ({
          index,
          commessaId: alloc.commessaId,
          importo: alloc.importo,
          issues: [
            !alloc.commessaId && 'commessaId mancante',
            (typeof alloc.importo !== 'number' || alloc.importo <= 0) && 'importo non valido'
          ].filter(Boolean)
        }))
      });
    }
    
    // Inizializza service e applica allocazioni
    const allocationService = new AllocationWorkflowService();
    
    const result = await allocationService.applyVirtualAllocations({
      movimentoId,
      allocazioniVirtuali,
      userId,
      note
    });
    
    // Log risultato per monitoring
    if (result.success) {
      console.log(`✅ Applied ${result.allocazioniCreate} allocations to movimento ${movimentoId}`);
    } else {
      console.error(`❌ Failed to apply allocations to movimento ${movimentoId}:`, result.error);
    }
    
    // Risposta con status code appropriato
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
    
  } catch (error) {
    console.error('❌ Critical error in apply allocation workflow:', error);
    res.status(500).json({
      success: false,
      allocazioniCreate: 0,
      error: 'Errore interno del server durante applicazione allocazioni',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;