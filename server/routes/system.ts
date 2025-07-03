import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import express, { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FieldDefinition, parseFixedWidth } from '../lib/fixedWidthParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const prisma = new PrismaClient();
const execAsync = promisify(exec);

// Il tipo per le scritture di staging verrà inferito direttamente dalla query
// per garantire la massima corrispondenza con lo schema Prisma attuale.

// Tipi inferiti e dati assemblati manualmente per robustezza
type RigaContabileConAllocazioni = Prisma.ImportScritturaRigaContabileGetPayload<{
  include: { allocazioni: true }
}>;
type ScritturaStagingCompleta = Prisma.ImportScritturaTestataGetPayload<{
  include: { righeIva: true }
}> & {
  righeContabili: RigaContabileConAllocazioni[];
};

router.get('/status', async (c, res) => {
  try {
    const [
      contiCount,
      clientiCount,
      fornitoriCount,
      causaliCount,
      codiciIvaCount,
      condizioniPagamentoCount,
      commesseCount,
      scrittureCount,
      vociAnaliticheCount,
    ] = await prisma.$transaction([
      prisma.conto.count(),
      prisma.cliente.count(),
      prisma.fornitore.count(),
      prisma.causaleContabile.count(),
      prisma.codiceIva.count(),
      prisma.condizionePagamento.count(),
      prisma.commessa.count(),
      prisma.scritturaContabile.count(),
      prisma.voceAnalitica.count(),
    ]);

    // Recupera i wizard steps usando query raw (client Prisma non ancora aggiornato)
    const wizardSteps = await prisma.$queryRaw<Array<{
      stepId: string;
      stepTitle: string;
      templateName: string;
      status: string;
      fileName?: string;
      recordCount?: number;
      completedAt?: Date;
      error?: string;
    }>>`SELECT * FROM "WizardStep"`;

    // Crea una mappa degli step del wizard per accesso rapido
    const wizardStepsMap = wizardSteps.reduce((acc, step) => {
      acc[step.stepId] = step;
      return acc;
    }, {} as Record<string, { stepId: string; stepTitle: string; templateName: string; status: string; fileName?: string; recordCount?: number; completedAt?: Date; error?: string; }>);

    const anagrafichePerCommessaPopolate =
      clientiCount > 0 && vociAnaliticheCount > 0;

    // La condizione di inizializzazione ora considera i dati per la commessa
    const needsInitialization = !anagrafichePerCommessaPopolate;

    return res.json({
      needsInitialization,
      status: needsInitialization ? 'incomplete' : 'ready',
      checks: {
        conti: { 
          count: contiCount, 
          status: contiCount > 0 ? 'ok' : 'missing',
          wizardStep: wizardStepsMap['conti'] || null
        },
        clienti: { 
          count: clientiCount, 
          status: clientiCount > 0 ? 'ok' : 'missing',
          wizardStep: wizardStepsMap['clienti'] || null
        },
        vociAnalitiche: {
          count: vociAnaliticheCount,
          status: vociAnaliticheCount > 0 ? 'ok' : 'missing',
        },
        fornitori: { count: fornitoriCount, status: fornitoriCount > 0 ? 'ok' : 'missing' },
        causali: { 
          count: causaliCount, 
          status: causaliCount > 0 ? 'ok' : 'missing',
          wizardStep: wizardStepsMap['causali'] || null
        },
        codiciIva: { count: codiciIvaCount, status: 'ok' },
        condizioniPagamento: { count: condizioniPagamentoCount, status: 'ok' },
        commesse: { count: commesseCount, status: 'ok' },
        scritture: { count: scrittureCount, status: 'ok' },
      },
      wizardSteps: wizardStepsMap,
    });
  } catch (error) {
    console.error("Failed to get system status:", error);
    return res.status(500).json({ error: 'Failed to retrieve system status' });
  }
});

// Nuovo endpoint per recuperare i dettagli degli import logs
router.get('/import-logs/:templateName?', async (req, res) => {
  try {
    // Per ora restituiamo dati mock finché non risolviamo il client Prisma
    const mockData = {
      logs: [],
      stats: {
        'piano_dei_conti': { total: 1, success: 1, failed: 0, totalRows: 150 },
        'anagrafica_clifor': { total: 1, success: 1, failed: 0, totalRows: 320 },
        'causali': { total: 0, success: 0, failed: 0, totalRows: 0 }
      }
    };
    
    return res.json(mockData);
  } catch (error) {
    console.error("Failed to get import logs:", error);
    return res.status(500).json({ error: 'Failed to retrieve import logs' });
  }
});

// Funzione helper per il seeding dei dati di base
async function seedBasicData() {
    const SYSTEM_CUSTOMER_ID = 'system_customer_01';
    const SYSTEM_SUPPLIER_ID = 'system_supplier_01';

    console.log('Inizio popolamento dati di base...');

    // 1. Voci Analitiche
    console.log('Creazione Voci Analitiche...');
    const vociAnaliticheData = [
        { id: 'costo_personale', nome: 'Costo del personale' },
        { id: 'gestione_automezzi', nome: 'Gestione automezzi' },
        { id: 'gestione_attrezzature', nome: 'Gestione attrezzature' },
        { id: 'sacchi_materiali_consumo', nome: 'Sacchi e materiali di consumo' },
        { id: 'servizi_esterni', nome: 'Servizi esterni' },
        { id: 'pulizia_strade_rurali', nome: 'Pulizia strade rurali' },
        { id: 'gestione_aree_operative', nome: 'Gestione Aree operative' },
        { id: 'ammortamento_automezzi', nome: 'Ammortamento Automezzi' },
        { id: 'ammortamento_attrezzature', nome: 'Ammortamento Attrezzature' },
        { id: 'locazione_sedi_operative', nome: 'Locazione sedi operative' },
        { id: 'trasporti_esterni', nome: 'Trasporti esterni' },
        { id: 'spese_generali', nome: 'Spese generali' },
        { id: 'selezione_valorizzazione_rifiuti', nome: 'Selezione e Valorizzazione Rifiuti Differenziati' },
        { id: 'gestione_frazione_organica', nome: 'Gestione frazione organica' },
    ];
    
    for (const voce of vociAnaliticheData) {
        await prisma.voceAnalitica.create({ data: voce });
    }

    // 2. Cliente e Fornitore di sistema
    await prisma.cliente.create({
        data: {
            id: SYSTEM_CUSTOMER_ID,
            externalId: 'SYS-CUST',
            nome: 'Cliente di Sistema (per importazioni)',
        }
    });

    await prisma.fornitore.create({
        data: {
            id: SYSTEM_SUPPLIER_ID,
            externalId: 'SYS-SUPP',
            nome: 'Fornitore di Sistema (per importazioni)',
        }
    });

    // 3. Cliente PENISOLAVERDE SPA e commesse
    console.log('Creazione cliente e commesse per PENISOLAVERDE SPA...');
    const clientePenisolaVerde = await prisma.cliente.create({
        data: {
            nome: 'PENISOLAVERDE SPA',
            externalId: 'PENISOLAVERDE_SPA',
            piva: '01234567890',
        }
    });

    // Commesse Principali (Comuni)
    const commessaSorrento = await prisma.commessa.create({
        data: {
            id: 'sorrento',
            nome: 'Comune di Sorrento',
            descrizione: 'Commessa principale per il comune di Sorrento',
            clienteId: clientePenisolaVerde.id,
        },
    });

    const commessaMassa = await prisma.commessa.create({
        data: {
            id: 'massa_lubrense',
            nome: 'Comune di Massa Lubrense',
            descrizione: 'Commessa principale per il comune di Massa Lubrense',
            clienteId: clientePenisolaVerde.id,
        },
    });

    const commessaPiano = await prisma.commessa.create({
        data: {
            id: 'piano_di_sorrento',
            nome: 'Comune di Piano di Sorrento',
            descrizione: 'Commessa principale per il comune di Piano di Sorrento',
            clienteId: clientePenisolaVerde.id,
        },
    });

    // Commesse Figlie (Attività / Centri di Costo)
    await prisma.commessa.createMany({
        data: [
            {
                id: 'sorrento_igiene_urbana',
                nome: 'Igiene Urbana - Sorrento',
                descrizione: 'Servizio di igiene urbana per Sorrento',
                clienteId: clientePenisolaVerde.id,
                parentId: commessaSorrento.id,
            },
            {
                id: 'massa_lubrense_igiene_urbana',
                nome: 'Igiene Urbana - Massa Lubrense',
                descrizione: 'Servizio di igiene urbana per Massa Lubrense',
                clienteId: clientePenisolaVerde.id,
                parentId: commessaMassa.id,
            },
            {
                id: 'piano_di_sorrento_igiene_urbana',
                nome: 'Igiene Urbana - Piano di Sorrento',
                descrizione: 'Servizio di igiene urbana per Piano di Sorrento',
                clienteId: clientePenisolaVerde.id,
                parentId: commessaPiano.id,
            },
            {
                id: 'sorrento_verde_pubblico',
                nome: 'Verde Pubblico - Sorrento',
                descrizione: 'Servizio di gestione del verde pubblico per Sorrento',
                clienteId: clientePenisolaVerde.id,
                parentId: commessaSorrento.id,
            },
        ]
    });

    console.log('Dati di base popolati correttamente.');
}

router.post('/reset-database', async (req, res, next) => {
    try {
        console.log("Inizio azzeramento e ripopolamento database...");

        // Usiamo i nomi delle tabelle reali (considerando i @@map)
        await prisma.$executeRaw`TRUNCATE TABLE "import_allocazioni", "ImportScritturaRigaContabile", "ImportScritturaRigaIva", "import_scritture_testate", "Allocazione", "RigaIva", "RigaScrittura", "BudgetVoce", "ScritturaContabile", "Conto", "Commessa", "CausaleContabile", "CondizionePagamento", "CodiceIva", "VoceAnalitica", "Fornitore", "Cliente", "WizardState", "ImportLog" RESTART IDENTITY CASCADE;`;
        
        console.log("Database azzerato con successo. I template di importazione sono stati preservati.");

        // Fase 2: Ripopolamento con dati di base
        console.log("Fase 2: Ripopolamento con dati di base...");
        await seedBasicData();

        const message = "Database azzerato e ripopolato con successo con i dati di base.";
        console.log(message);
        res.status(200).json({ message });

    } catch (error) {
        console.error('Errore durante l\'azzeramento e ripopolamento del database:', error);
        next(error);
    }
});

// Rotta per consolidare le scritture importate
router.post('/consolidate-scritture', async (req, res) => {
  console.log('[Consolidate] Avvio del processo di consolidamento...');

  // 1. Lettura dati con query separate per evitare problemi con il client Prisma
  const testate = await prisma.importScritturaTestata.findMany({ include: { righeIva: true } });
  const righeContabili = await prisma.importScritturaRigaContabile.findMany({ include: { allocazioni: true } });

  // 2. Assemblaggio manuale dei dati
  const scrittureDaImportare = testate.map(testata => ({
    ...testata,
    righeContabili: righeContabili.filter(riga => riga.codiceUnivocoScaricamento === testata.codiceUnivocoScaricamento),
  }));

  if (scrittureDaImportare.length === 0) {
    console.log('[Consolidate] Nessuna scrittura da importare.');
    return res.json({ message: 'Nessuna nuova scrittura da consolidare.' });
  }

  console.log(`[Consolidate] Trovate ${scrittureDaImportare.length} scritture da consolidare.`);
  let importateConSuccesso = 0;
  const errori: { id: string, errore: string }[] = [];

  for (const scritturaStaging of scrittureDaImportare) {
    try {
      await prisma.$transaction(async (tx) => {
        // Creazione Testata
        const scritturaFinale = await tx.scritturaContabile.create({
          data: {
            externalId: scritturaStaging.codiceUnivocoScaricamento,
            data: scritturaStaging.dataRegistrazione,
            dataDocumento: scritturaStaging.dataDocumento,
            numeroDocumento: scritturaStaging.numeroDocumento,
            descrizione: scritturaStaging.descrizioneCausale || scritturaStaging.noteMovimento || 'Scrittura importata',
          },
        });

        const progressivoToRigaIdMap: Record<number, string> = {};

        // Creazione Righe Scrittura e Allocazioni
        for (const rigaStaging of scritturaStaging.righeContabili) {
          if (!rigaStaging.codiceConto) continue;
          
          const conto = await tx.conto.findFirst({ where: { codice: rigaStaging.codiceConto } });
          if (!conto) throw new Error(`Conto ${rigaStaging.codiceConto} non trovato.`);

          const rigaFinale = await tx.rigaScrittura.create({
            data: {
              scritturaContabileId: scritturaFinale.id,
              contoId: conto.id,
              descrizione: rigaStaging.note || 'Riga importata',
              dare: rigaStaging.importoDare || 0,
              avere: rigaStaging.importoAvere || 0,
            },
          });

          progressivoToRigaIdMap[rigaStaging.riga] = rigaFinale.id;

          if (conto.voceAnaliticaId && rigaStaging.allocazioni.length > 0) {
            for (const allocazioneStaging of rigaStaging.allocazioni) {
              if (!allocazioneStaging.commessaId) continue;
              const commessa = await tx.commessa.findFirst({ where: { id: allocazioneStaging.commessaId } });
              if (commessa) {
                await tx.allocazione.create({
                  data: {
                    rigaScritturaId: rigaFinale.id,
                    commessaId: commessa.id,
                    voceAnaliticaId: conto.voceAnaliticaId,
                    importo: allocazioneStaging.importo,
                  },
                });
              }
            }
          }
        }
        
        // Creazione Righe IVA
        for (const rigaIvaStaging of scritturaStaging.righeIva) {
          if (!rigaIvaStaging.codiceIva || !rigaIvaStaging.riga) continue;
          
          let codiceIva = await tx.codiceIva.findUnique({ where: { id: rigaIvaStaging.codiceIva } });
          if (!codiceIva) {
            codiceIva = await tx.codiceIva.create({ data: { id: rigaIvaStaging.codiceIva, descrizione: `Auto-creata: ${rigaIvaStaging.codiceIva}`, aliquota: 0 } });
          }

          const rigaContabileId = progressivoToRigaIdMap[rigaIvaStaging.riga];
          if (rigaContabileId) {
            await tx.rigaIva.create({
              data: {
                rigaScritturaId: rigaContabileId,
                codiceIvaId: codiceIva.id,
                imponibile: rigaIvaStaging.imponibile || 0,
                imposta: rigaIvaStaging.imposta || 0,
              },
            });
          }
        }
      });

      // Cancellazione record di staging post-transazione
      await prisma.importScritturaTestata.delete({ where: { id: scritturaStaging.id } });
      importateConSuccesso++;
    } catch (error) {
      console.error(`[Consolidate] Fallito per scrittura ID ${scritturaStaging.codiceUnivocoScaricamento}:`, error);
      errori.push({ id: scritturaStaging.codiceUnivocoScaricamento, errore: (error as Error).message });
    }
  }

  const message = `Consolidamento terminato. ${importateConSuccesso} scritture importate, ${errori.length} fallite.`;
  console.log(`[Consolidate] ${message}`);

  res.status(errori.length > 0 ? 500 : 200).json({ message, errori });
});

// Endpoint per svuotare le tabelle di staging delle scritture
router.post(
  '/clear-staging-scritture',
  async (req: Request, res: Response) => {
    console.log(
      'Ricevuta richiesta di svuotamento tabelle di staging scritture'
    );
    try {
      await prisma.$transaction([
        prisma.importScritturaRigaContabile.deleteMany(),
        prisma.importScritturaRigaIva.deleteMany(),
        prisma.importScritturaTestata.deleteMany(),
      ]);
      console.log('Tabelle di staging delle scritture svuotate con successo');
      res
        .status(200)
        .json({ message: 'Tabelle di staging svuotate con successo' });
    } catch (error) {
      console.error(
        "Errore durante lo svuotamento delle tabelle di staging:",
        error
      );
      res
        .status(500)
        .json({ message: 'Errore durante lo svuotamento delle tabelle' });
    }
  }
);

// Endpoint per svuotare la tabella Conti
router.post('/clear-conti', async (req: Request, res: Response) => {
  console.log('Ricevuta richiesta di svuotamento tabella Conti');
  try {
    await prisma.conto.deleteMany();
    console.log('Tabella Conti svuotata con successo');
    res.status(200).json({ message: 'Tabella Conti svuotata con successo' });
  } catch (error) {
    console.error("Errore durante lo svuotamento della tabella Conti:", error);
    res.status(500).json({ message: 'Errore durante lo svuotamento della tabella Conti' });
  }
});

// Funzione helper per leggere i file di dati
const readDataFile = (fileName: string) => {
    const filePath = path.join(__dirname, `../../.docs/dati_cliente/${fileName}`);
    return fs.readFileSync(filePath, 'latin1');
};

const readPrimaNotaFile = (fileName: string) => {
    const filePath = path.join(__dirname, `../../.docs/dati_cliente/prima_nota/${fileName}`);
    return fs.readFileSync(filePath, 'latin1');
}

// ====================================================================
// DEFINIZIONE DEGLI SCHEMI DI PARSING - Fonte: .docs/tracciati_definitivi.md
// ====================================================================

const pntestaSchema: FieldDefinition[] = [
    { fieldName: 'codiceFiscaleAzienda', start: 4, length: 16, end: 19, type: 'string' },
    { fieldName: 'codiceUnivocoScaricamento', start: 21, length: 12, end: 32, type: 'string' },
    { fieldName: 'codiceCausale', start: 40, length: 6, end: 45, type: 'string' },
    { fieldName: 'descrizioneCausale', start: 46, length: 40, end: 85, type: 'string' },
    { fieldName: 'dataRegistrazione', start: 86, length: 8, end: 93, type: 'date' },
    { fieldName: 'tipoRegistroIva', start: 96, length: 1, end: 96, type: 'string' },
    { fieldName: 'codiceFiscaleClienteFornitore', start: 100, length: 16, end: 115, type: 'string' },
    { fieldName: 'siglaClienteFornitore', start: 117, length: 12, end: 128, type: 'string' },
    { fieldName: 'dataDocumento', start: 129, length: 8, end: 136, type: 'date' },
    { fieldName: 'numeroDocumento', start: 137, length: 12, end: 148, type: 'string' },
    { fieldName: 'totaleDocumento', start: 173, length: 12, end: 184, type: 'number' },
    { fieldName: 'noteMovimento', start: 193, length: 60, end: 252, type: 'string' },
];

const pnrigconSchema: FieldDefinition[] = [
    { fieldName: 'codiceUnivocoScaricamento', start: 4, length: 12, end: 15, type: 'string' },
    { fieldName: 'progressivoNumeroRigo', start: 16, length: 3, end: 18, type: 'number' },
    { fieldName: 'tipoConto', start: 19, length: 1, end: 19, type: 'string' },
    { fieldName: 'codiceFiscaleClienteFornitore', start: 20, length: 16, end: 35, type: 'string' },
    { fieldName: 'siglaClienteFornitore', start: 37, length: 12, end: 48, type: 'string' },
    { fieldName: 'conto', start: 49, length: 10, end: 58, type: 'string' },
    { fieldName: 'importoDare', start: 59, length: 12, end: 70, type: 'number' },
    { fieldName: 'importoAvere', start: 71, length: 12, end: 82, type: 'number' },
    { fieldName: 'note', start: 83, length: 60, end: 142, type: 'string' },
    { fieldName: 'flagMovimentiAnalitici', start: 248, length: 1, end: 248, type: 'number' },
];

const pnrigivaSchema: FieldDefinition[] = [
    { fieldName: 'codiceUnivocoScaricamento', start: 4, length: 12, end: 15, type: 'string' },
    { fieldName: 'codiceIva', start: 16, length: 4, end: 19, type: 'string' },
    { fieldName: 'contropartita', start: 20, length: 10, end: 29, type: 'string' },
    { fieldName: 'imponibile', start: 30, length: 12, end: 41, type: 'number' },
    { fieldName: 'imposta', start: 42, length: 12, end: 53, type: 'number' },
    { fieldName: 'importoLordo', start: 90, length: 12, end: 101, type: 'number' },
    { fieldName: 'siglaContropartita', start: 162, length: 12, end: 173, type: 'string' },
];

const movanacSchema: FieldDefinition[] = [
    { fieldName: 'codiceUnivocoScaricamento', start: 4, length: 12, end: 15, type: 'string' },
    { fieldName: 'progressivoRigaContabile', start: 16, length: 3, end: 18, type: 'number' },
    { fieldName: 'centroDiCosto', start: 19, length: 4, end: 22, type: 'string' },
    { fieldName: 'importo', start: 23, length: 12, end: 34, type: 'number' },
];

const clienteFornitoreSchema: FieldDefinition[] = [
    { fieldName: 'codiceUnivocoScaricamento', start: 21, length: 12, end: 32, type: 'string' },
    { fieldName: 'codiceFiscale', start: 33, length: 16, end: 48, type: 'string' },
    { fieldName: 'tipo', start: 50, length: 1, end: 50, type: 'string' },
    { fieldName: 'externalId', start: 71, length: 12, end: 82, type: 'string' },
    { fieldName: 'partitaIva', start: 83, length: 11, end: 93, type: 'string' },
    { fieldName: 'ragioneSociale', start: 95, length: 60, end: 154, type: 'string' },
    { fieldName: 'cognome', start: 155, length: 20, end: 174, type: 'string' },
    { fieldName: 'nome', start: 175, length: 20, end: 194, type: 'string' },
];

const contiGenSchema: FieldDefinition[] = [
    { fieldName: 'codice', start: 0, length: 10, end: 9, type: 'string' },
    { fieldName: 'descrizione', start: 10, length: 40, end: 49, type: 'string' },
    { fieldName: 'tipo', start: 50, length: 1, end: 50, type: 'string' }, // C, R, P, F, L
];

const causaliSchema: FieldDefinition[] = [
    { fieldName: 'externalId', start: 4, length: 6, end: 9, type: 'string' },
    { fieldName: 'descrizione', start: 10, length: 40, end: 49, type: 'string' },
];

const codiciIvaSchema: FieldDefinition[] = [
    { fieldName: 'externalId', start: 3, length: 5, end: 7, type: 'string' },
    { fieldName: 'descrizione', start: 8, length: 40, end: 47, type: 'string' },
    { fieldName: 'aliquota', start: 48, length: 2, end: 49, type: 'string' },
];

const codPagamSchema: FieldDefinition[] = [
    { fieldName: 'externalId', start: 4, length: 8, end: 11, type: 'string' },
    { fieldName: 'descrizione', start: 12, length: 40, end: 51, type: 'string' },
    { fieldName: 'codice', start: 0, length: 4, end: 3, type: 'string' },
];

// ---- NUOVE INTERFACCE E SCHEMI PER PRIMA NOTA ----
interface Pntesta {
    codiceUnivocoScaricamento: string;
    codiceCausale: string;
    descrizioneCausale: string;
    dataRegistrazione: Date;
    dataDocumento: Date;
    numeroDocumento: string;
    noteMovimento: string;
}
interface Pnrigcon {
    codiceUnivocoScaricamento: string;
    progressivoRiga: number;
    conto: string;
    note: string;
    importoDare: number;
    importoAvere: number;
}
interface Pnrigiva {
    codiceUnivocoScaricamento: string;
    progressivoRiga: number;
    codiceIva: string;
    contropartita: string;
    imponibile: number;
    imposta: number;
    importoLordo: number;
}
interface Movanac {
    codiceUnivocoScaricamento: string;
    rigaContabileRiferimento: number;
    centroDiCosto: string;
    importo: number;
}
interface ScritturaCompleta {
    testata: Pntesta;
    righe: (Pnrigcon & { allocazioni: Movanac[] })[];
    righeIva: Pnrigiva[];
}

// Funzione helper per assemblare le scritture complete
function buildScrittureComplete(
    testate: Pntesta[], righe: Pnrigcon[], righeIva: Pnrigiva[], allocazioni: Movanac[]
): ScritturaCompleta[] {
    const allocazioniMap = new Map<string, Movanac[]>();
    for (const alloc of allocazioni) {
        const key = `${alloc.codiceUnivocoScaricamento}_${alloc.rigaContabileRiferimento}`;
        if (!allocazioniMap.has(key)) {
            allocazioniMap.set(key, []);
        }
        allocazioniMap.get(key)!.push(alloc);
    }

    const righeConAllocazioni = righe.map(riga => {
        const key = `${riga.codiceUnivocoScaricamento}_${riga.progressivoRiga}`;
        return { ...riga, allocazioni: allocazioniMap.get(key) || [] };
    });

    const righeMap = new Map<string, (Pnrigcon & { allocazioni: Movanac[] })[]>();
    for (const riga of righeConAllocazioni) {
        if (!righeMap.has(riga.codiceUnivocoScaricamento)) {
            righeMap.set(riga.codiceUnivocoScaricamento, []);
        }
        righeMap.get(riga.codiceUnivocoScaricamento)!.push(riga);
    }
    
    const righeIvaMap = new Map<string, Pnrigiva[]>();
    for (const riga of righeIva) {
        if (!righeIvaMap.has(riga.codiceUnivocoScaricamento)) {
            righeIvaMap.set(riga.codiceUnivocoScaricamento, []);
        }
        righeIvaMap.get(riga.codiceUnivocoScaricamento)!.push(riga);
    }

    return testate.map(testata => ({
        testata,
        righe: righeMap.get(testata.codiceUnivocoScaricamento) || [],
        righeIva: righeIvaMap.get(testata.codiceUnivocoScaricamento) || [],
    }));
}

router.post('/seed-demo-data', async (req, res) => {
    console.log('[System] Ricevuta richiesta di seeding con dati demo.');
    try {
        console.log('[System] Esecuzione di `prisma migrate reset --force`...');
        await execAsync('npx prisma migrate reset --force');
        console.log('[System] Reset del database completato.');
        
        console.log('[Seeding Demo] Avvio del popolamento con dati di esempio...');

        // 1. Parsing di tutte le anagrafiche e prima nota
        const clientiFornitoriRaw = parseFixedWidth<ClienteFornitore>(readPrimaNotaFile('A_CLIFOR.TXT'), clienteFornitoreSchema);
        console.log(`[Debug] Clienti parsati totali: ${clientiFornitoriRaw.length}`);
        console.log(`[Debug] Clienti di tipo 'C': ${clientiFornitoriRaw.filter(cf => cf.tipo === 'C').length}`);
        console.log(`[Debug] Primi 3 clienti:`, clientiFornitoriRaw.filter(cf => cf.tipo === 'C').slice(0, 3).map(cf => ({
            tipo: cf.tipo,
            externalId: cf.externalId,
            ragioneSociale: cf.ragioneSociale,
            codiceFiscale: cf.codiceFiscale
        })));
        
        const contiRaw = parseFixedWidth<ContoGen>(readDataFile('ContiGen.txt'), contiGenSchema);
        const causaliRaw = parseFixedWidth<Causale>(readDataFile('Causali.txt'), causaliSchema);
        const codiciIvaRaw = parseFixedWidth<CodiceIva>(readDataFile('CodicIva.txt'), codiciIvaSchema);
        const pagamentiRaw = parseFixedWidth<CodPagam>(readDataFile('CodPagam.txt'), codPagamSchema);

        const pntesta = parseFixedWidth<Pntesta>(readPrimaNotaFile('PNTESTA.TXT'), pntestaSchema);
        const pnrigcon = parseFixedWidth<Pnrigcon>(readPrimaNotaFile('PNRIGCON.TXT'), pnrigconSchema);
        const pnrigiva = parseFixedWidth<Pnrigiva>(readPrimaNotaFile('PNRIGIVA.TXT'), pnrigivaSchema);
        const movanac = parseFixedWidth<Movanac>(readPrimaNotaFile('MOVANAC.TXT'), movanacSchema);
        
        // --- INIZIO TRANSAZIONE ---
        await prisma.$transaction(async (tx) => {
            // 2. Creazione Anagrafiche
            const clientiDaCreare = clientiFornitoriRaw
                .filter(cf => cf.tipo === 'C')
                .map(cf => ({
                    id: cf.externalId.trim(),
                    externalId: cf.externalId.trim(),
                    nome: cf.ragioneSociale.trim() || `${cf.cognome.trim()} ${cf.nome.trim()}`,
                    piva: cf.partitaIva.trim() || cf.codiceFiscale.trim(),
                }));
            
            console.log(`[Debug] Clienti da creare: ${clientiDaCreare.length}`);
            console.log(`[Debug] Primi 3 clienti da creare:`, clientiDaCreare.slice(0, 3));
            
            await tx.cliente.createMany({
                data: clientiDaCreare,
                skipDuplicates: true,
            });

            await tx.fornitore.createMany({
                data: clientiFornitoriRaw
                    .filter(cf => cf.tipo === 'F')
                    .map(cf => ({
                        id: cf.externalId.trim(),
                        externalId: cf.externalId.trim(),
                        nome: cf.ragioneSociale.trim() || `${cf.cognome.trim()} ${cf.nome.trim()}`,
                        piva: cf.partitaIva.trim() || cf.codiceFiscale.trim(),
                    })),
                skipDuplicates: true,
            });

            await tx.conto.createMany({
                data: contiRaw.map(c => ({
                    id: c.codice.trim(),
                    externalId: c.codice.trim(),
                    nome: c.descrizione.trim(),
                    tipo: c.tipo === 'C' ? 'Costo' : c.tipo === 'R' ? 'Ricavo' : 'Patrimoniale',
                })),
                skipDuplicates: true,
            });

            await tx.causaleContabile.createMany({
                data: causaliRaw.map(c => ({
                    id: c.externalId.trim(),
                    externalId: c.externalId.trim(),
                    descrizione: c.descrizione.trim(),
                })),
                skipDuplicates: true,
            });
            
            await tx.codiceIva.createMany({
                data: codiciIvaRaw.map(c => {
                    const aliquotaStr = c.aliquota.replace('O', '').replace('S','').trim();
                    return {
                        id: c.externalId.trim(),
                        externalId: c.externalId.trim(),
                        descrizione: c.descrizione.trim(),
                        aliquota: parseFloat(aliquotaStr) || 0
                    }
                }),
                skipDuplicates: true,
            });

             await tx.condizionePagamento.createMany({
                data: pagamentiRaw.map(p => ({
                    id: p.externalId.trim(),
                    externalId: p.externalId.trim(),
                    descrizione: p.descrizione.trim(),
                    codice: p.codice.trim()
                })),
                skipDuplicates: true,
            });

            console.log('[Seeding Demo] Anagrafiche create.');

            // 3. Creazione Commesse per la Demo
            console.log('[Seeding Demo] Creazione Commesse...');
            // Troviamo un cliente più semplice per le commesse demo, evitando quelli con spazi o caratteri speciali
            const clientiDisponibili = clientiFornitoriRaw.filter(cf => cf.tipo === 'C');
            console.log(`[Debug] Clienti disponibili: ${clientiDisponibili.length}`);
            
            // Cerchiamo un cliente con externalId senza spazi o caratteri speciali
            const primoCliente = clientiDisponibili.find(cf => 
                cf.externalId && 
                cf.externalId.trim() && 
                !/[.\s]/.test(cf.externalId.trim()) &&
                cf.ragioneSociale && 
                cf.ragioneSociale.trim()
            ) || clientiDisponibili[0]; // fallback al primo disponibile

            if (!primoCliente) {
                throw new Error("Nessun cliente trovato nei dati del file A_CLIFOR.TXT. Impossibile creare commesse demo.");
            }
            const clienteDemoId = primoCliente.externalId.trim();
            const nomeClienteDemo = (primoCliente.ragioneSociale || `${primoCliente.cognome} ${primoCliente.nome}`).trim();
            console.log(`[Seeding Demo] Utilizzo del cliente '${nomeClienteDemo}' (ID: ${clienteDemoId}) per le commesse demo.`);
            
            const clienteDb = await tx.cliente.findFirst({ where: { externalId: clienteDemoId } });
            if (!clienteDb) {
                console.log(`[Debug] Cliente non trovato nel DB. Cercando tra tutti i clienti creati...`);
                const tuttiClienti = await tx.cliente.findMany();
                console.log(`[Debug] Clienti nel DB: ${tuttiClienti.length}`, tuttiClienti.map(c => ({ id: c.id, externalId: c.externalId })));
                throw new Error(`Cliente con externalId ${clienteDemoId} non trovato nel DB dopo il seeding delle anagrafiche.`);
            }

            // Creiamo le commesse basandoci sui centri di costo presenti nei dati di test
            // per garantire la coerenza con le allocazioni di MOVANAC.TXT
            const commesseDemoData = [
                { id: '1', nome: 'Commessa Servizi Generali', clienteId: clienteDb.id },
                { id: '2', nome: 'Commessa Manutenzione', clienteId: clienteDb.id },
                { id: '3', nome: 'Commessa Pulizia', clienteId: clienteDb.id },
                { id: '4', nome: 'Commessa Varie', clienteId: clienteDb.id },
                { id: '6', nome: 'Commessa Amministrazione', clienteId: clienteDb.id },
                { id: '9', nome: 'Commessa Consulenze', clienteId: clienteDb.id },
                { id: '1000', nome: 'Commessa Smaltimento', clienteId: clienteDb.id }
            ];

            await tx.commessa.createMany({
                data: commesseDemoData,
                skipDuplicates: true,
            });
            
            console.log(`[Seeding Demo] Create ${commesseDemoData.length} commesse demo per il cliente ${nomeClienteDemo}.`);

            // 4. Inserimento Scritture di Staging
            console.log('[Seeding Demo] Inserimento scritture di staging...');
            const scrittureComplete = buildScrittureComplete(pntesta, pnrigcon, pnrigiva, movanac);

            // Filtra le scritture per includere solo quelle definite nel piano di test
            const codiciDemo = [
                '012025110315', // Allocazione Complessa (1-a-N)
                '012025110008', // Allocazione Semplice (1-a-1)
                '012025110002', // Documento con Righe Multiple
                '012025110013', // Riga non Allocata
            ];
            
            const scrittureDemo = scrittureComplete.filter(s => codiciDemo.includes(s.testata.codiceUnivocoScaricamento));
            
            console.log(`[Seeding Demo] Trovate ${scrittureDemo.length} scritture valide per la demo.`);

            for (const scrittura of scrittureDemo) {
                const codiceUnivoco = scrittura.testata.codiceUnivocoScaricamento;

                // 4.1 Creazione Testata
                await tx.importScritturaTestata.create({
                    data: {
                        codiceUnivocoScaricamento: codiceUnivoco,
                        codiceCausale: scrittura.testata.codiceCausale.trim(),
                        descrizioneCausale: scrittura.testata.descrizioneCausale.trim(),
                        dataRegistrazione: scrittura.testata.dataRegistrazione,
                        dataDocumento: scrittura.testata.dataDocumento,
                        numeroDocumento: scrittura.testata.numeroDocumento.trim(),
                        noteMovimento: scrittura.testata.noteMovimento.trim(),
                    },
                });

                // 4.2 Creazione Righe Contabili e Allocazioni
                for (const [index, rigaContabile] of scrittura.righe.entries()) {
                    const createdRiga = await tx.importScritturaRigaContabile.create({
                        data: {
                            codiceUnivocoScaricamento: codiceUnivoco,
                            riga: index + 1, // Usiamo l'indice per un progressivo affidabile
                            codiceConto: rigaContabile.conto.trim(),
                            descrizioneConto: rigaContabile.note.trim() || `Conto ${rigaContabile.conto.trim()}`,
                            importoDare: rigaContabile.importoDare,
                            importoAvere: rigaContabile.importoAvere,
                            note: rigaContabile.note.trim(),
                            insDatiMovimentiAnalitici: false,
                        }
                    });

                    // Associa le allocazioni dalla riga contabile se esistono
                    if (rigaContabile.allocazioni && rigaContabile.allocazioni.length > 0) {
                        const allocazioniDaCreare: Prisma.ImportAllocazioneCreateManyInput[] = [];
                        for (const allocazioneFile of rigaContabile.allocazioni) {
                            allocazioniDaCreare.push({
                                importScritturaRigaContabileId: createdRiga.id,
                                commessaId: allocazioneFile.centroDiCosto.trim(), // L'ID della commessa è direttamente il centro di costo
                                importo: allocazioneFile.importo,
                                suggerimentoAutomatico: true,
                            });
                        }
                        if (allocazioniDaCreare.length > 0) {
                            await tx.importAllocazione.createMany({
                                data: allocazioniDaCreare,
                            });
                        }
                    }
                }

                // 4.3 Creazione Righe IVA
                if (scrittura.righeIva.length > 0) {
                    await tx.importScritturaRigaIva.createMany({
                        data: scrittura.righeIva.map((riga, index) => ({
                            codiceUnivocoScaricamento: codiceUnivoco,
                            riga: index + 1, // Uso l'indice + 1 per un progressivo affidabile
                            codiceIva: riga.codiceIva.trim(),
                            codiceConto: riga.contropartita.trim(),
                            imponibile: riga.imponibile,
                            imposta: riga.imposta,
                        }))
                    });
                }
            }
            console.log(`[Seeding Demo] Create ${scrittureDemo.length} scritture di staging con le relative allocazioni.`);

        });
        // --- FINE TRANSAZIONE ---

        console.log('[Seeding Demo] Popolamento completato con successo.');
        res.status(200).json({ message: 'Database resettato e popolato con dati demo completi.' });

    } catch (error) {
        console.error("Errore durante la preparazione dei dati demo:", error);
        const e = error as Error;
        res.status(500).json({ message: 'Errore durante la preparazione dei dati demo.', details: e.message, stack: e.stack });
    }
});

// ---- INTERFACCE PER I TIPI PARSATI ----
interface ClienteFornitore {
    codiceFiscale: string;
    tipo: 'C' | 'F';
    partitaIva: string;
    externalId: string;
    ragioneSociale: string;
    cognome: string;
    nome: string;
}
interface ContoGen {
    codice: string;
    descrizione: string;
    tipo: 'C' | 'R' | 'P' | 'F' | 'L';
}
interface Causale {
    externalId: string;
    descrizione: string;
}
interface CodiceIva {
    externalId: string;
    descrizione: string;
    aliquota: string;
}
interface CodPagam {
    externalId: string;
    descrizione: string;
    codice: string;
}

export default router; 