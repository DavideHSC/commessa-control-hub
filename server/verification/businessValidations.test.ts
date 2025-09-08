import { PrismaClient } from '@prisma/client';
import { 
  validateCommessaHierarchy,
  validateBudgetVsAllocazioni,
  validateCommessaDeletion,
  validateCommessaUpdate
} from '../import-engine/core/validations/businessValidations.js';

// --- SETUP ---
const prisma = new PrismaClient();

describe('Business Validations - Critical Tests', () => {

  beforeEach(async () => {
    console.log('\n🧼 Pulizia tabelle per test validazioni...');
    // Pulisce tutte le tabelle per test isolati
    await prisma.$transaction([
      prisma.allocazione.deleteMany({}),
      prisma.budgetVoce.deleteMany({}),
      prisma.commessa.deleteMany({}),
      prisma.voceAnalitica.deleteMany({}),
      prisma.rigaScrittura.deleteMany({}),
      prisma.scritturaContabile.deleteMany({}),
      prisma.cliente.deleteMany({}),
    ]);
    console.log('✅ Tabelle pulite per test.');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- TEST VALIDAZIONE GERARCHIA COMMESSE ---
  describe('validateCommessaHierarchy()', () => {

    it('dovrebbe permettere gerarchia valida senza cicli', async () => {
      // SETUP: Crea cliente
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      // Crea gerarchia: Parent -> Child -> Grandchild
      const parent = await prisma.commessa.create({
        data: {
          nome: 'Commessa Parent',
          clienteId: cliente.id
        }
      });

      const child = await prisma.commessa.create({
        data: {
          nome: 'Commessa Child',
          clienteId: cliente.id,
          parentId: parent.id
        }
      });

      const grandchild = await prisma.commessa.create({
        data: {
          nome: 'Commessa Grandchild',
          clienteId: cliente.id
        }
      });

      // ESECUZIONE: Prova ad assegnare grandchild come figlio di child
      const result = await validateCommessaHierarchy(prisma, grandchild.id, child.id);

      // VERIFICHE
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('dovrebbe bloccare ciclo diretto (A->B, B->A)', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessaA = await prisma.commessa.create({
        data: {
          nome: 'Commessa A',
          clienteId: cliente.id
        }
      });

      const commessaB = await prisma.commessa.create({
        data: {
          nome: 'Commessa B',
          clienteId: cliente.id,
          parentId: commessaA.id  // B è figlia di A
        }
      });

      // ESECUZIONE: Prova a rendere A figlia di B (ciclo!)
      const result = await validateCommessaHierarchy(prisma, commessaA.id, commessaB.id);

      // VERIFICHE
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('ciclo nella gerarchia');
    });

    it('dovrebbe bloccare ciclo complesso (A->B->C->A)', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessaA = await prisma.commessa.create({
        data: {
          nome: 'Commessa A',
          clienteId: cliente.id
        }
      });

      const commessaB = await prisma.commessa.create({
        data: {
          nome: 'Commessa B',
          clienteId: cliente.id,
          parentId: commessaA.id  // B è figlia di A
        }
      });

      const commessaC = await prisma.commessa.create({
        data: {
          nome: 'Commessa C',
          clienteId: cliente.id,
          parentId: commessaB.id  // C è figlia di B
        }
      });

      // ESECUZIONE: Prova a rendere A figlia di C (A->B->C->A ciclo!)
      const result = await validateCommessaHierarchy(prisma, commessaA.id, commessaC.id);

      // VERIFICHE
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('ciclo nella gerarchia');
    });

    it('dovrebbe bloccare auto-referenza (A->A)', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessa = await prisma.commessa.create({
        data: {
          nome: 'Commessa Self',
          clienteId: cliente.id
        }
      });

      // ESECUZIONE: Prova auto-referenza
      const result = await validateCommessaHierarchy(prisma, commessa.id, commessa.id);

      // VERIFICHE
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('parent di se stessa');
    });

    it('dovrebbe permettere rimozione parent (null)', async () => {
      // ESECUZIONE: Test rimozione parent
      const result = await validateCommessaHierarchy(prisma, 'any_id', null);

      // VERIFICHE
      expect(result.isValid).toBe(true);
    });
  });

  // --- TEST VALIDAZIONE BUDGET VS ALLOCAZIONI ---
  describe('validateBudgetVsAllocazioni()', () => {

    it('dovrebbe warning se allocazioni superano budget', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessa = await prisma.commessa.create({
        data: {
          nome: 'Commessa Budget Test',
          clienteId: cliente.id
        }
      });

      const voceAnalitica = await prisma.voceAnalitica.create({
        data: {
          nome: 'Voce Test',
          descrizione: 'Voce per test budget',
          tipo: 'Generale'
        }
      });

      // Budget di 1000€
      await prisma.budgetVoce.create({
        data: {
          commessaId: commessa.id,
          voceAnaliticaId: voceAnalitica.id,
          importo: 1000.00
        }
      });

      // Crea scrittura e allocazione che supera il budget
      const scrittura = await prisma.scritturaContabile.create({
        data: {
          data: new Date(),
          descrizione: 'Scrittura test',
          externalId: 'BUDGET_TEST'
        }
      });

      const rigaScrittura = await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scrittura.id,
          descrizione: 'Riga test',
          dare: 1500.00,  // Supera il budget di 1000€
          avere: 0
        }
      });

      // Allocazione che supera budget
      await prisma.allocazione.create({
        data: {
          importo: 1500.00,
          rigaScritturaId: rigaScrittura.id,
          commessaId: commessa.id,
          voceAnaliticaId: voceAnalitica.id,
          dataMovimento: new Date(),
          tipoMovimento: 'COSTO_EFFETTIVO'
        }
      });

      // ESECUZIONE
      const result = await validateBudgetVsAllocazioni(prisma, commessa.id);

      // VERIFICHE
      expect(result.isValid).toBe(true); // Non blocca, ma avvisa
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('supera budget');
      expect(result.warnings![0]).toContain('€1500.00');
      expect(result.warnings![0]).toContain('€1000.00');
    });

    it('dovrebbe validare correttamente budget con costi e ricavi', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessa = await prisma.commessa.create({
        data: {
          nome: 'Commessa Mix Test',
          clienteId: cliente.id
        }
      });

      const voceAnalitica = await prisma.voceAnalitica.create({
        data: {
          nome: 'Voce Mix',
          descrizione: 'Voce per test mix costi/ricavi',
          tipo: 'Generale'
        }
      });

      // Budget di 500€
      await prisma.budgetVoce.create({
        data: {
          commessaId: commessa.id,
          voceAnaliticaId: voceAnalitica.id,
          importo: 500.00
        }
      });

      // Crea scritture
      const scritturaCosto = await prisma.scritturaContabile.create({
        data: {
          data: new Date(),
          descrizione: 'Scrittura costo',
          externalId: 'COSTO_TEST'
        }
      });

      const scritturaRicavo = await prisma.scritturaContabile.create({
        data: {
          data: new Date(),
          descrizione: 'Scrittura ricavo',
          externalId: 'RICAVO_TEST'
        }
      });

      const rigaCosto = await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scritturaCosto.id,
          descrizione: 'Riga costo',
          dare: 800.00,
          avere: 0
        }
      });

      const rigaRicavo = await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scritturaRicavo.id,
          descrizione: 'Riga ricavo',
          dare: 0,
          avere: 400.00
        }
      });

      // Allocazioni: 800€ costi - 400€ ricavi = 400€ netto (sotto budget 500€)
      await prisma.allocazione.createMany({
        data: [
          {
            importo: 800.00,
            rigaScritturaId: rigaCosto.id,
            commessaId: commessa.id,
            voceAnaliticaId: voceAnalitica.id,
            dataMovimento: new Date(),
            tipoMovimento: 'COSTO_EFFETTIVO'
          },
          {
            importo: 400.00,
            rigaScritturaId: rigaRicavo.id,
            commessaId: commessa.id,
            voceAnaliticaId: voceAnalitica.id,
            dataMovimento: new Date(),
            tipoMovimento: 'RICAVO_EFFETTIVO'
          }
        ]
      });

      // ESECUZIONE
      const result = await validateBudgetVsAllocazioni(prisma, commessa.id);

      // VERIFICHE - 400€ netto < 500€ budget, dovrebbe essere ok
      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeUndefined();
    });

    it('dovrebbe validare nuovo budget vs allocazioni esistenti', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessa = await prisma.commessa.create({
        data: {
          nome: 'Commessa New Budget Test',
          clienteId: cliente.id
        }
      });

      const voceAnalitica = await prisma.voceAnalitica.create({
        data: {
          nome: 'Voce New Budget',
          descrizione: 'Voce per test nuovo budget',
          tipo: 'Generale'
        }
      });

      // Allocazione esistente di 1200€
      const scrittura = await prisma.scritturaContabile.create({
        data: {
          data: new Date(),
          descrizione: 'Scrittura esistente',
          externalId: 'EXIST_TEST'
        }
      });

      const rigaScrittura = await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scrittura.id,
          descrizione: 'Riga esistente',
          dare: 1200.00,
          avere: 0
        }
      });

      await prisma.allocazione.create({
        data: {
          importo: 1200.00,
          rigaScritturaId: rigaScrittura.id,
          commessaId: commessa.id,
          voceAnaliticaId: voceAnalitica.id,
          dataMovimento: new Date(),
          tipoMovimento: 'COSTO_EFFETTIVO'
        }
      });

      // ESECUZIONE: Prova nuovo budget di 1000€ (inferiore alle allocazioni esistenti)
      const newBudget = [
        {
          voceAnaliticaId: voceAnalitica.id,
          budgetPrevisto: 1000.00  // Questo campo è per i test, non per il DB
        }
      ];

      const result = await validateBudgetVsAllocazioni(prisma, commessa.id, newBudget);

      // VERIFICHE
      expect(result.isValid).toBe(true); // Non blocca
      expect(result.warnings).toBeDefined();
      expect(result.warnings![0]).toContain('€1200.00 supera budget €1000.00');
    });

    it('dovrebbe passare validazione senza allocazioni', async () => {
      // SETUP: Commessa senza allocazioni
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessa = await prisma.commessa.create({
        data: {
          nome: 'Commessa Vuota',
          clienteId: cliente.id
        }
      });

      // ESECUZIONE
      const result = await validateBudgetVsAllocazioni(prisma, commessa.id);

      // VERIFICHE
      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeUndefined();
    });
  });

  // --- TEST VALIDAZIONE ELIMINAZIONE COMMESSA ---
  describe('validateCommessaDeletion()', () => {

    it('dovrebbe bloccare eliminazione commessa con figli', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const parent = await prisma.commessa.create({
        data: {
          nome: 'Commessa Parent',
          clienteId: cliente.id
        }
      });

      await prisma.commessa.create({
        data: {
          nome: 'Commessa Child',
          clienteId: cliente.id,
          parentId: parent.id
        }
      });

      // ESECUZIONE
      const result = await validateCommessaDeletion(prisma, parent.id);

      // VERIFICHE
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('commesse figlie');
      expect(result.error).toContain('1');
    });

    it('dovrebbe bloccare eliminazione commessa con allocazioni', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessa = await prisma.commessa.create({
        data: {
          nome: 'Commessa Con Allocazioni',
          clienteId: cliente.id
        }
      });

      const voceAnalitica = await prisma.voceAnalitica.create({
        data: {
          nome: 'Voce Test',
          descrizione: 'Voce per test',
          tipo: 'Generale'
        }
      });

      const scrittura = await prisma.scritturaContabile.create({
        data: {
          data: new Date(),
          descrizione: 'Scrittura test',
          externalId: 'DEL_TEST'
        }
      });

      const rigaScrittura = await prisma.rigaScrittura.create({
        data: {
          scritturaContabileId: scrittura.id,
          descrizione: 'Riga test',
          dare: 100.00,
          avere: 0
        }
      });

      // Crea allocazione
      await prisma.allocazione.create({
        data: {
          importo: 100.00,
          rigaScritturaId: rigaScrittura.id,
          commessaId: commessa.id,
          voceAnaliticaId: voceAnalitica.id,
          dataMovimento: new Date(),
          tipoMovimento: 'COSTO_EFFETTIVO'
        }
      });

      // ESECUZIONE
      const result = await validateCommessaDeletion(prisma, commessa.id);

      // VERIFICHE
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('allocazioni esistenti');
      expect(result.error).toContain('1');
    });

    it('dovrebbe permettere eliminazione commessa pulita', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessa = await prisma.commessa.create({
        data: {
          nome: 'Commessa Pulita',
          clienteId: cliente.id
        }
      });

      // ESECUZIONE - commessa senza figli né allocazioni
      const result = await validateCommessaDeletion(prisma, commessa.id);

      // VERIFICHE
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  // --- TEST VALIDAZIONE COMPLETA UPDATE ---
  describe('validateCommessaUpdate()', () => {

    it('dovrebbe combinare tutte le validazioni correttamente', async () => {
      // SETUP
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const parentCommessa = await prisma.commessa.create({
        data: {
          nome: 'Parent Commessa',
          clienteId: cliente.id
        }
      });

      const commessa = await prisma.commessa.create({
        data: {
          nome: 'Commessa Update Test',
          clienteId: cliente.id
        }
      });

      const voceAnalitica = await prisma.voceAnalitica.create({
        data: {
          nome: 'Voce Update',
          descrizione: 'Voce per test update',
          tipo: 'Generale'
        }
      });

      // ESECUZIONE: Update valido (parent esistente, budget ok)
      const updateData = {
        parentId: parentCommessa.id,
        budget: [
          {
            voceAnaliticaId: voceAnalitica.id,
            budgetPrevisto: 2000.00
          }
        ]
      };

      const result = await validateCommessaUpdate(prisma, commessa.id, updateData);

      // VERIFICHE
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('dovrebbe fallire su validazione gerarchia anche se budget ok', async () => {
      // SETUP ciclo
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Cliente Test',
          externalId: 'TEST_CLIENT'
        }
      });

      const commessaA = await prisma.commessa.create({
        data: {
          nome: 'Commessa A',
          clienteId: cliente.id
        }
      });

      const commessaB = await prisma.commessa.create({
        data: {
          nome: 'Commessa B',
          clienteId: cliente.id,
          parentId: commessaA.id
        }
      });

      // ESECUZIONE: Prova ciclo A->B, B->A
      const updateData = {
        parentId: commessaB.id  // Crea ciclo!
      };

      const result = await validateCommessaUpdate(prisma, commessaA.id, updateData);

      // VERIFICHE
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('ciclo nella gerarchia');
    });
  });
});