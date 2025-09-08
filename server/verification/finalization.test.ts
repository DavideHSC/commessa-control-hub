import { PrismaClient } from '@prisma/client';
import { finalizeRigaIva, finalizeAllocazioni } from '../import-engine/finalization.js';

// --- SETUP ---
const prisma = new PrismaClient();

describe('Finalization Functions - Test Coverage', () => {

  beforeEach(async () => {
    console.log('\n🧼 Pulizia tabelle per test finalizzazione...');
    // Pulisce tabelle di staging e produzione per test isolati
    await prisma.$transaction([
      prisma.allocazione.deleteMany({}),
      prisma.rigaIva.deleteMany({}),
      prisma.stagingAllocazione.deleteMany({}),
      prisma.stagingRigaIva.deleteMany({}),
      prisma.rigaScrittura.deleteMany({}),
      prisma.scritturaContabile.deleteMany({}),
      prisma.commessa.deleteMany({}),
      prisma.voceAnalitica.deleteMany({}),
      prisma.codiceIva.deleteMany({}),
      prisma.cliente.deleteMany({}),
    ]);
    console.log('✅ Tabelle pulite per test.');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- TEST FINALIZE RIGA IVA ---
  describe('finalizeRigaIva()', () => {
    
    it('dovrebbe processare correttamente righe IVA da staging a produzione', async () => {
      // SETUP: Crea dati di test
      const codiceIva = await prisma.codiceIva.create({
        data: {
          codice: 'IVA22',
          descrizione: 'IVA 22%',
          aliquota: 22,
          externalId: 'IVA22'
        }
      });

      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const scrittura = await prisma.scritturaContabile.create({
        data: {
          data: new Date(),
          descrizione: 'Scrittura test',
          externalId: 'SCRIT_001'
        }
      });

      const rigaScrittura = await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scrittura.id,
          descrizione: 'Riga test',
          dare: 100.50,
          avere: 0
        }
      });

      // Crea riga IVA in staging
      await prisma.stagingRigaIva.create({
        data: {
          codiceUnivocoScaricamento: 'SCRIT_001',
          rigaIdentifier: 'SCRIT_001-1',
          riga: '1',
          codiceIva: 'IVA22',
          contropartita: 'CONTO_IVA',
          imponibile: '100,50',
          imposta: '22,11',
          impostaNonConsiderata: '0,00',
          importoLordo: '122,61',
          note: 'Test note'
        }
      });

      // ESECUZIONE
      const result = await finalizeRigaIva(prisma);

      // VERIFICHE
      expect(result.count).toBe(1);

      const righeIva = await prisma.rigaIva.findMany();
      expect(righeIva).toHaveLength(1);
      expect(righeIva[0].imponibile).toBe(100.50);
      expect(righeIva[0].imposta).toBe(22.11);
      expect(righeIva[0].codiceIvaId).toBe(codiceIva.id);
      expect(righeIva[0].rigaScritturaId).toBe(rigaScrittura.id);
    });

    it('dovrebbe gestire parsing errato degli importi con resilienza', async () => {
      // SETUP: Codice IVA per test
      await prisma.codiceIva.create({
        data: {
          codice: 'IVA22',
          descrizione: 'IVA 22%',
          aliquota: 22,
          externalId: 'IVA22'
        }
      });

      // Riga IVA con importi malformati
      await prisma.stagingRigaIva.create({
        data: {
          codiceUnivocoScaricamento: 'SCRIT_BAD',
          rigaIdentifier: 'SCRIT_BAD-1',
          riga: '1',
          codiceIva: 'IVA22',
          contropartita: 'CONTO_IVA',
          imponibile: 'NON_NUMERICO',
          imposta: '',  // Vuoto
          impostaNonConsiderata: '0,00',
          importoLordo: 'MALFORMATO',
          note: 'Test malformato'
        }
      });

      // ESECUZIONE - dovrebbe gestire gli errori senza fallire
      const result = await finalizeRigaIva(prisma);

      // VERIFICHE - la funzione è resiliente e processa i record con valori di default
      expect(result.count).toBe(1);
      
      const righeIva = await prisma.rigaIva.findMany();
      expect(righeIva).toHaveLength(1);
      // Verifica che i valori malformati sono stati convertiti a 0
      expect(righeIva[0].imponibile).toBe(0);
      expect(righeIva[0].imposta).toBe(0);
      expect(righeIva[0].codiceIvaId).toBeDefined();
    });

    it('dovrebbe restituire count 0 se non ci sono dati in staging', async () => {
      // ESECUZIONE senza dati
      const result = await finalizeRigaIva(prisma);

      // VERIFICHE
      expect(result.count).toBe(0);
    });
  });

  // --- TEST FINALIZE ALLOCAZIONI ---
  describe('finalizeAllocazioni()', () => {

    it('dovrebbe creare automaticamente commesse e voci analitiche mancanti', async () => {
      // SETUP: Cliente di sistema
      const sistemaCliente = await prisma.cliente.create({
        data: {
          id: 'system_customer_01',
          nome: 'Cliente di Sistema',
          externalId: 'SYS-CUST'
        }
      });

      const scrittura = await prisma.scritturaContabile.create({
        data: {
          data: new Date(),
          descrizione: 'Scrittura per allocazione',
          externalId: 'ALLOC_001'
        }
      });

      const rigaScrittura = await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scrittura.id,
          descrizione: 'Riga per allocazione',
          dare: 500.00,
          avere: 0
        }
      });

      // Allocazione in staging con nuova commessa e voce
      await prisma.stagingAllocazione.create({
        data: {
          codiceUnivocoScaricamento: 'ALLOC_001',
          progressivoRigoContabile: '1',
          centroDiCosto: 'CDC_NUOVO',
          parametro: 'VOCE_NUOVA',
          allocazioneIdentifier: 'ALLOC_001-1'
        }
      });

      // ESECUZIONE
      const result = await finalizeAllocazioni(prisma);

      // VERIFICHE
      expect(result.count).toBe(1);

      // Verifica che commessa è stata creata
      const commesse = await prisma.commessa.findMany({
        where: { externalId: 'CDC_NUOVO' }
      });
      expect(commesse).toHaveLength(1);
      expect(commesse[0].nome).toBe('Centro di Costo CDC_NUOVO');

      // Verifica che voce analitica è stata creata
      const voci = await prisma.voceAnalitica.findMany({
        where: { nome: 'VOCE_NUOVA' }
      });
      expect(voci).toHaveLength(1);
      expect(voci[0].tipo).toBe('Generale');

      // Verifica che allocazione finale è stata creata
      const allocazioni = await prisma.allocazione.findMany();
      expect(allocazioni).toHaveLength(1);
      expect(allocazioni[0].importo).toBe(500.00);
      expect(allocazioni[0].tipoMovimento).toBe('COSTO_EFFETTIVO');
      expect(allocazioni[0].commessaId).toBe(commesse[0].id);
      expect(allocazioni[0].voceAnaliticaId).toBe(voci[0].id);
    });

    it('dovrebbe utilizzare commesse e voci esistenti se presenti', async () => {
      // SETUP: Cliente esistente
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Esistente',
          externalId: 'EXIST_CLIENT'
        }
      });

      // Commessa esistente
      const commessaEsistente = await prisma.commessa.create({
        data: {
          nome: 'Commessa Esistente',
          externalId: 'CDC_ESISTENTE',
          clienteId: cliente.id
        }
      });

      // Voce analitica esistente
      const voceEsistente = await prisma.voceAnalitica.create({
        data: {
          nome: 'VOCE_ESISTENTE',
          descrizione: 'Voce preesistente',
          tipo: 'Specifica'
        }
      });

      const scrittura = await prisma.scritturaContabile.create({
        data: {
          data: new Date(),
          descrizione: 'Scrittura esistente',
          externalId: 'EXIST_001'
        }
      });

      await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scrittura.id,
          descrizione: 'Riga esistente',
          dare: 0,
          avere: 250.00  // Ricavo
        }
      });

      // Allocazione che usa entità esistenti
      await prisma.stagingAllocazione.create({
        data: {
          codiceUnivocoScaricamento: 'EXIST_001',
          progressivoRigoContabile: '1',
          centroDiCosto: 'CDC_ESISTENTE',
          parametro: 'VOCE_ESISTENTE',
          allocazioneIdentifier: 'EXIST_001-1'
        }
      });

      // ESECUZIONE
      const result = await finalizeAllocazioni(prisma);

      // VERIFICHE
      expect(result.count).toBe(1);

      // Verifica che non sono state create nuove entità
      const commesse = await prisma.commessa.findMany();
      expect(commesse).toHaveLength(1); // Solo quella esistente
      expect(commesse[0].id).toBe(commessaEsistente.id);

      const voci = await prisma.voceAnalitica.findMany();
      expect(voci).toHaveLength(1); // Solo quella esistente
      expect(voci[0].id).toBe(voceEsistente.id);

      // Verifica allocazione con tipo movimento corretto (ricavo)
      const allocazioni = await prisma.allocazione.findMany();
      expect(allocazioni).toHaveLength(1);
      expect(allocazioni[0].importo).toBe(250.00);
      expect(allocazioni[0].tipoMovimento).toBe('RICAVO_EFFETTIVO');
    });

    it('dovrebbe saltare allocazioni con dati insufficienti', async () => {
      // SETUP: Allocazioni incomplete
      await prisma.stagingAllocazione.createMany({
        data: [
          {
            // Manca codiceUnivocoScaricamento
            progressivoRigoContabile: '1',
            centroDiCosto: 'CDC_1',
            parametro: 'VOCE_1',
            allocazioneIdentifier: 'INCOMPLETE_1'
          },
          {
            codiceUnivocoScaricamento: 'COMP_001',
            // Manca progressivoRigoContabile
            centroDiCosto: 'CDC_2',
            parametro: 'VOCE_2',
            allocazioneIdentifier: 'INCOMPLETE_2'
          },
          {
            codiceUnivocoScaricamento: 'COMP_002',
            progressivoRigoContabile: '1',
            // Manca centroDiCosto
            parametro: 'VOCE_3',
            allocazioneIdentifier: 'INCOMPLETE_3'
          }
        ]
      });

      // ESECUZIONE
      const result = await finalizeAllocazioni(prisma);

      // VERIFICHE - nessuna allocazione dovrebbe essere processata
      expect(result.count).toBe(0);
      
      const allocazioni = await prisma.allocazione.findMany();
      expect(allocazioni).toHaveLength(0);
    });

    it('dovrebbe restituire count 0 se non ci sono dati in staging', async () => {
      // ESECUZIONE senza dati
      const result = await finalizeAllocazioni(prisma);

      // VERIFICHE
      expect(result.count).toBe(0);
    });
  });

  // --- TEST PERFORMANCE ---
  describe('Performance Tests', () => {

    it('dovrebbe processare batch di righe IVA senza timeout', async () => {
      // SETUP: Codice IVA
      await prisma.codiceIva.create({
        data: {
          codice: 'IVA22',
          descrizione: 'IVA 22%',
          aliquota: 22,
          externalId: 'IVA22'
        }
      });

      // Crea molte righe IVA (100 per test performance)
      const righeStagingData = [];
      for (let i = 1; i <= 100; i++) {
        righeStagingData.push({
          codiceUnivocoScaricamento: `PERF_${i.toString().padStart(3, '0')}`,
          rigaIdentifier: `PERF_${i.toString().padStart(3, '0')}-1`,
          riga: '1',
          codiceIva: 'IVA22',
          contropartita: 'CONTO_IVA',
          imponibile: '100,00',
          imposta: '22,00',
          impostaNonConsiderata: '0,00',
          importoLordo: '122,00',
          note: `Test perf ${i}`
        });
      }

      await prisma.stagingRigaIva.createMany({
        data: righeStagingData
      });

      // ESECUZIONE con timeout
      const startTime = Date.now();
      const result = await finalizeRigaIva(prisma);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // VERIFICHE - la funzione processa tutte le righe anche senza FK validi
      expect(result.count).toBe(100); // Processa tutte le righe con resilienza
      expect(duration).toBeLessThan(10000); // Max 10 secondi
      
      // Verifica che le righe sono state create (anche con rigaScritturaId null)
      const righeIva = await prisma.rigaIva.findMany();
      expect(righeIva).toHaveLength(100);
      
      console.log(`✅ Performance test completato in ${duration}ms - ${result.count} righe processate`);
    }, 15000); // 15 secondi di timeout per il test
  });
});