import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Importa la factory dell'app e creane un'istanza per il test
import { createApp } from '../app.js';
const app = createApp();

const prisma = new PrismaClient();

// Percorso corretto alla cartella dei dati di test per la prima nota
const TEST_DATA_DIR = path.join(process.cwd(), '.docs', 'dati_cliente', 'dati_esempio', 'prima_nota', 'tests');

describe('API End-to-End: Import Scritture Contabili (/api/import/scritture-contabili)', () => {

  // Pulisce le tabelle di staging prima di ogni test per garantire l'isolamento
  beforeEach(async () => {
    console.log('🧼 Pulizia delle tabelle di staging prima del test...');
    await prisma.$transaction([
      prisma.stagingAllocazione.deleteMany(),
      prisma.stagingRigaIva.deleteMany(),
      prisma.stagingRigaContabile.deleteMany(),
      prisma.stagingTestata.deleteMany(),
    ]);
    console.log('✅ Tabelle di staging pulite.');
  });

  // Test potenziato per verificare la correttezza dei dati grezzi, inclusi i nuovi campi
  it('dovrebbe importare i file e salvare i dati grezzi come stringhe nello staging, inclusi i nuovi campi', async () => {
    console.log(`📂 Lettura dei file di test da: ${TEST_DATA_DIR}`);
    
    const pnTestaPath = path.join(TEST_DATA_DIR, 'PNTESTA.TXT');
    const pnRigConPath = path.join(TEST_DATA_DIR, 'PNRIGCON.TXT');
    const pnRigIvaPath = path.join(TEST_DATA_DIR, 'PNRIGIVA.TXT');
    const movAnacPath = path.join(TEST_DATA_DIR, 'MOVANAC.TXT');

    // 1. ESECUZIONE: Simula l'upload dei file tramite l'endpoint API
    console.log('🚀 Invio della richiesta POST a /api/import/scritture-contabili...');
    
    const response = await request(app)
      .post('/api/import/scritture-contabili') // Endpoint corretto
      .attach('pntesta', pnTestaPath)
      .attach('pnrigcon', pnRigConPath)
      .attach('pnrigiva', pnRigIvaPath)
      .attach('movanac', movAnacPath);

    // 2. VERIFICA DELLA RISPOSTA API
    console.log('📊 Analisi della risposta API...');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.stats.testateStaging).toBeGreaterThan(0);
    console.log(`✅ Risposta API valida: ${response.body.stats.testateStaging} testate caricate.`);
    
    // 3. VERIFICA SPECIFICA SUL DATABASE
    console.log('🔍 Verifica del record campione sul database di staging...');
    
    const externalIdCampione = '012025110012';
    const testataCampione = await prisma.stagingTestata.findUnique({
      where: {
        codiceUnivocoScaricamento: externalIdCampione,
      },
    });

    expect(testataCampione).toBeDefined();
    
    // --- VERIFICA CAMPI ESISTENTI (NON REGRESSIONE) ---
    console.log(`Verifica campi base per ${externalIdCampione}...`);
    expect(testataCampione?.dataRegistrazione).toBe('02012025');
    expect(testataCampione?.totaleDocumento).toBe('43.97');
    console.log(`✅ Campi base ("dataRegistrazione", "totaleDocumento") corretti.`);

    // --- VERIFICA NUOVI CAMPI AGGIUNTI (STAGING TESTATA) ---
    console.log(`Verifica campi aggiuntivi per StagingTestata (${externalIdCampione})...`);
    expect(testataCampione?.enasarco).toBe('');
    expect(testataCampione?.stato).toBe('');
    expect(testataCampione?.tipoGestionePartite).toBe('');
    console.log(`✅ Nuovi campi di StagingTestata verificati (atteso: stringa vuota).`);

    // --- VERIFICA NUOVI CAMPI AGGIUNTI (STAGING RIGA CONTABILE) ---
    console.log(`Verifica campi aggiuntivi per StagingRigaContabile (${externalIdCampione})...`);
    const rigaContabileCampione = await prisma.stagingRigaContabile.findFirst({
      where: { 
        codiceUnivocoScaricamento: externalIdCampione,
        progressivoRigo: '1' 
      }
    });
    
    expect(rigaContabileCampione).toBeDefined();
    expect(rigaContabileCampione?.noteDiCompetenza).toBe('');
    expect(rigaContabileCampione?.insDatiMovimentiAnalitici).toBe('false');
    expect(rigaContabileCampione?.siglaConto).toBe('');
    console.log(`✅ Nuovi campi di StagingRigaContabile verificati.`);

    // --- VERIFICA NUOVI CAMPI AGGIUNTI (STAGING RIGA IVA) ---
    console.log(`Verifica campi aggiuntivi per StagingRigaIva (${externalIdCampione})...`);
    const rigaIvaCampione = await prisma.stagingRigaIva.findFirst({
      where: {
        codiceUnivocoScaricamento: externalIdCampione
      }
    });

    expect(rigaIvaCampione).toBeDefined();
    expect(rigaIvaCampione?.impostaIntrattenimenti).toBe('');
    expect(rigaIvaCampione?.imponibile50CorrNonCons).toBe('');
    console.log(`✅ Nuovi campi di StagingRigaIva verificati.`);
    
  }, 30000);
});

// Pulisce la connessione al DB dopo che tutti i test sono finiti
afterAll(async () => {
    await prisma.$disconnect();
});