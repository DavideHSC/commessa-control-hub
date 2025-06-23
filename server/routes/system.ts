import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import express, { Request, Response, NextFunction } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Tipo per le righe contabili con tutti i campi necessari
type RigaContabileCompleta = Prisma.ImportScritturaRigaContabileGetPayload<{
  include: {}
}>;

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
    }, {} as Record<string, any>);

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

        // Fase 1: Azzeramento
        console.log("Fase 1: Azzeramento database...");
        await prisma.$transaction([
            // Modelli che dipendono da altri
            prisma.allocazione.deleteMany({}),
            prisma.rigaIva.deleteMany({}),
            prisma.rigaScrittura.deleteMany({}),
            prisma.budgetVoce.deleteMany({}),
            prisma.scritturaContabile.deleteMany({}),
            prisma.commessa.deleteMany({}),
            
            // Modelli "radice" o quasi
            prisma.causaleContabile.deleteMany({}),
            prisma.condizionePagamento.deleteMany({}),
            prisma.codiceIva.deleteMany({}),
            prisma.voceAnalitica.deleteMany({}),
            prisma.conto.deleteMany({}),
            prisma.fornitore.deleteMany({}),
            prisma.cliente.deleteMany({}),
        ]);
        console.log("Database azzerato con successo. I template sono stati preservati.");

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

  // 1. Lettura di tutti i dati dalle tabelle di staging
  const scrittureDaImportare = await prisma.importScritturaTestata.findMany({
    include: {
      righeContabili: true,
      righeIva: true,
    },
  });

  if (scrittureDaImportare.length === 0) {
    console.log('[Consolidate] Nessuna scrittura da importare.');
    return res.json({ message: 'Nessuna nuova scrittura da consolidare.' });
  }

  console.log(`[Consolidate] Trovate ${scrittureDaImportare.length} scritture da consolidare.`);
  let importateConSuccesso = 0;
  const errori: { id: string, errore: string }[] = [];

  // 2. Esecuzione del consolidamento in una transazione per ogni scrittura
  for (const scritturaStaging of scrittureDaImportare) {
    try {
      await prisma.$transaction(async (tx) => {
        // --- 3. Creazione della Scrittura Contabile (Testata) ---
        const scritturaFinale = await tx.scritturaContabile.create({
          data: {
            externalId: scritturaStaging.codiceUnivocoScaricamento,
            data: scritturaStaging.dataRegistrazione,
            dataDocumento: scritturaStaging.dataDocumento,
            numeroDocumento: scritturaStaging.numeroDocumento,
            descrizione: scritturaStaging.descrizioneCausale || scritturaStaging.noteMovimento || 'Scrittura importata',
          },
        });

        // --- 4. Iterazione e creazione delle Righe Scrittura e Allocazioni ---
        for (const rigaStaging of scritturaStaging.righeContabili) {
          // Cast temporaneo per accedere ai campi corretti - il campo esiste nel database
          const riga = rigaStaging as any;
          if (!riga.codiceConto) continue;
          
          const conto = await tx.conto.findFirst({
            where: { codice: riga.codiceConto },
          });
          
          if (!conto) {
            console.warn(`Conto ${riga.codiceConto} non trovato in anagrafica`);
            continue;
          }

          // Creazione della riga di scrittura finale
          const rigaFinale = await tx.rigaScrittura.create({
            data: {
              scritturaContabileId: scritturaFinale.id,
              contoId: conto.id,
              descrizione: riga.note || 'Riga importata',
              dare: riga.importoDare || 0,
              avere: riga.importoAvere || 0,
            },
          });

          // --- 5. Creazione Allocazione Analitica (se dati presenti) ---
          if (riga.insDatiMovimentiAnalitici && riga.centroDiCosto && conto.voceAnaliticaId) {
            const commessa = await tx.commessa.findFirst({
              where: { externalId: riga.centroDiCosto },
            });
            
            if (!commessa) {
               console.warn(`Commessa con externalId ${riga.centroDiCosto} non trovata. Allocazione saltata.`);
            } else {
              await tx.allocazione.create({
                data: {
                  rigaScritturaId: rigaFinale.id,
                  commessaId: commessa.id,
                  voceAnaliticaId: conto.voceAnaliticaId,
                  importo: riga.importoAnalitico || riga.importoDare || riga.importoAvere || 0,
                  descrizione: `Allocazione importata per riga ${riga.progressivoNumeroRigo}`,
                },
              });
            }
          }
        }
        
        // --- 6. Iterazione e creazione delle Righe IVA ---
        for (const rigaIvaStaging of scritturaStaging.righeIva) {
          if (!rigaIvaStaging.codiceIva) continue;

          // Trova il codice IVA o crealo se non esiste
          let codiceIva = await tx.codiceIva.findUnique({
            where: { id: rigaIvaStaging.codiceIva },
          });

          if (!codiceIva) {
            console.warn(`Codice IVA ${rigaIvaStaging.codiceIva} non trovato. Verrà creato automaticamente.`);
            codiceIva = await tx.codiceIva.create({
              data: {
                id: rigaIvaStaging.codiceIva,
                descrizione: `IVA creata automaticamente - ${rigaIvaStaging.codiceIva}`,
                aliquota: 0, // Default, da revisionare
              }
            });
          }

          // Trova la riga di scrittura a cui collegare la riga IVA
          // Assumiamo che la prima riga contabile sia quella principale
          const rigaContabilePrincipale = await tx.rigaScrittura.findFirst({
            where: { scritturaContabileId: scritturaFinale.id },
            orderBy: { dare: 'desc' } // O un'altra logica per trovare la riga corretta
          });

          if (rigaContabilePrincipale) {
            await tx.rigaIva.create({
              data: {
                rigaScritturaId: rigaContabilePrincipale.id,
                codiceIvaId: codiceIva.id,
                imponibile: rigaIvaStaging.imponibile || 0,
                imposta: rigaIvaStaging.imposta || 0,
              },
            });
          } else {
            console.warn(`Nessuna riga contabile trovata per la scrittura ${scritturaFinale.id} per associare la riga IVA.`);
          }
        }
      });

      // Se la transazione ha successo, si può cancellare il record di staging
      await prisma.importScritturaTestata.delete({
        where: { id: scritturaStaging.id },
      });

      importateConSuccesso++;
    } catch (error) {
      console.error(`[Consolidate] Fallito il consolidamento per la scrittura ID ${scritturaStaging.codiceUnivocoScaricamento}:`, error);
      errori.push({ id: scritturaStaging.codiceUnivocoScaricamento, errore: (error as Error).message });
    }
  }

  const message = `Consolidamento terminato. ${importateConSuccesso} scritture importate con successo, ${errori.length} fallite.`;
  console.log(`[Consolidate] ${message}`);

  if (errori.length > 0) {
    return res.status(500).json({ message, errori });
  }

  return res.json({ message });
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

export default router; 