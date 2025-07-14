import 'dotenv/config'; // Carica le variabili d'ambiente
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

// Importa le rotte
import clientiRoutes from './routes/clienti';
import fornitoriRoutes from './routes/fornitori';
import registrazioniRoutes from './routes/registrazioni';
import dashboardRoutes from './routes/dashboard';
import databaseRoutes from './routes/database';
import importScrittureRoutes from './routes/importScritture';
import importAnagraficheRoutes from './routes/importAnagrafiche';
import causaliRoutes from './routes/causali';
import vociAnaliticheRoutes from './routes/vociAnalitiche';
import regoleRipartizioneRoutes from './routes/regoleRipartizione';
import contiRoutes from './routes/conti';
import commesseRoutes from './routes/commesse';
import importTemplatesRoutes from './routes/importTemplates';
import codiciIvaRoutes from './routes/codiciIva';
import condizioniPagamentoRoutes from './routes/condizioniPagamento';
import importContiRoutes from './routes/importConti';
import systemRoutes from './routes/system';
import statsRoutes from './routes/stats';
import importPrimaNota from './routes/importPrimaNota';
import stagingRoutes from './routes/staging'; // Aggiungo l'import
import commesseWithPerformanceRoutes from './routes/commesseWithPerformance';

// Import delle nuove rotte V2
import importRouterV2 from './routes/v2/import';

// Imports for temporary test route
import { ImportScrittureContabiliWorkflow } from './import-engine/orchestration/workflows/importScrittureContabiliWorkflow';
import { DLQService } from './import-engine/persistence/dlq/DLQService';
import { TelemetryService } from './import-engine/core/telemetry/TelemetryService';
import * as fs from 'fs/promises';
import * as path from 'path';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Registra le rotte
app.use('/api/clienti', clientiRoutes);
app.use('/api/fornitori', fornitoriRoutes);
app.use('/api/registrazioni', registrazioniRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/import/scritture', importPrimaNota);
app.use('/api/import/conti', importContiRoutes);
app.use('/api/import/anagrafiche', importAnagraficheRoutes);
app.use('/api/causali', causaliRoutes);
app.use('/api/voci-analitiche', vociAnaliticheRoutes);
app.use('/api/regole-ripartizione', regoleRipartizioneRoutes);
app.use('/api/conti', contiRoutes);
app.use('/api/commesse', commesseRoutes);
app.use('/api/commesse-performance', commesseWithPerformanceRoutes);
app.use('/api/import-templates', importTemplatesRoutes);
app.use('/api/codici-iva', codiciIvaRoutes);
app.use('/api/condizioni-pagamento', condizioniPagamentoRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/database/stats', statsRoutes);
app.use('/api/staging', stagingRoutes); // Aggiungo la rotta

// Setup delle nuove rotte V2
app.use('/api/v2/import', importRouterV2);

// Endpoint di base per testare il server
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Commessa Control Hub API' });
});

// Temporary test route for ImportScrittureContabiliWorkflow
app.get('/test-import-scritture', async (req: Request, res: Response) => {
  console.log(`
--- Starting ImportScrittureContabiliWorkflow Test ---`);
  const dlqService = new DLQService(prisma);
  const telemetryService = new TelemetryService();
  const workflow = new ImportScrittureContabiliWorkflow(prisma, dlqService, telemetryService);

  const dataPath = 'G:/HSC/Reale/commessa-control-hub/.docs/dati_cliente/prima_nota/';
  const pnTestaPath = path.join(dataPath, 'PNTESTA.TXT');
  const pnRigConPath = path.join(dataPath, 'PNRIGCON.TXT');
  const pnRigIvaPath = path.join(dataPath, 'PNRIGIVA.TXT');
  const movAnacPath = path.join(dataPath, 'MOVANAC.TXT');

  try {
    const pnTestaContent = await fs.readFile(pnTestaPath);
    const pnRigConContent = await fs.readFile(pnRigConPath);
    const pnRigIvaContent = await fs.readFile(pnRigIvaPath);
    const movAnacContent = await fs.readFile(movAnacPath);

    const files = {
      pnTesta: pnTestaContent,
      pnRigCon: pnRigConContent,
      pnRigIva: pnRigIvaContent,
      movAnac: movAnacContent,
    };

    const result = await workflow.execute(files);
    console.log('ImportScrittureContabiliWorkflow Test Result:', JSON.stringify(result, null, 2));
    res.json({ message: 'Test completed', result });
  } catch (error) {
    console.error('ImportScrittureContabiliWorkflow Test Failed:', error);
    res.status(500).json({ message: 'Test failed', error: error instanceof Error ? error.message : String(error) });
  }
  console.log(`--- Finished ImportScrittureContabiliWorkflow Test ---
`);
});

// Gestione errori globale (esempio base)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Qualcosa è andato storto!');
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});

// Gestione della chiusura del processo
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const router = Router();
router.use('/dashboard', dashboardRoutes);
router.use('/voci-analitiche', vociAnaliticheRoutes);
router.use('/import-templates', importTemplatesRoutes);
router.use('/import-scritture', importScrittureRoutes);
router.use('/system', systemRoutes);

export default router; 