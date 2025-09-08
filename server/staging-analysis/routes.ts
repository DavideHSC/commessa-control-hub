import express from 'express';
import { AnagraficaResolver } from './services/AnagraficaResolver.js';
import { RigheAggregator } from './services/RigheAggregator.js';
import { AllocationCalculator } from './services/AllocationCalculator.js';
import { UserPresentationMapper } from './services/UserPresentationMapper.js';
import { AllocationWorkflowTester } from './services/AllocationWorkflowTester.js';
import { BusinessValidationTester } from './services/BusinessValidationTester.js';

const router = express.Router();

// Sezione A: Risoluzione Anagrafica
router.get('/anagrafiche-resolution', async (req, res) => {
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
router.get('/righe-aggregation', async (req, res) => {
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
router.get('/allocation-status', async (req, res) => {
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
router.get('/user-movements', async (req, res) => {
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

export default router;