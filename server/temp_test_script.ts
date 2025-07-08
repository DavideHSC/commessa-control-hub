import { ImportScrittureContabiliWorkflow } from './import-engine/orchestration/workflows/importScrittureContabiliWorkflow';
import { PrismaClient } from '@prisma/client';
import { DLQService } from './import-engine/persistence/dlq/DLQService';
import { TelemetryService } from './import-engine/core/telemetry/TelemetryService';
import * as fs from 'fs/promises';
import * as path from 'path';

async function runTest() {
  const prisma = new PrismaClient();
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

    console.log('Starting test for ImportScrittureContabiliWorkflow...');
    const result = await workflow.execute(files);
    console.log('Test completed. Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
