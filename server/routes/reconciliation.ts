import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

/**
 * Esegue il processo di riconciliazione delle scritture contabili.
 * 1. Filtra le scritture di staging per i soli conti rilevanti per le commesse.
 * 2. Tenta la riconciliazione automatica tramite dati di allocazione diretta (MOVANAC).
 * 3. Tenta la riconciliazione automatica tramite regole di ripartizione predefinite.
 * 4. Prepara le scritture rimanenti per la riconciliazione manuale, suggerendo una voce analitica.
 * 5. Restituisce un riepilogo del processo.
 */
router.post('/run', async (req, res) => {
  console.log('Avvio del processo di riconciliazione...');

  try {
    // 1. Pre-Filtro Intelligente
    console.log('[Recon] Fase 1: Filtro Intelligente');
    const contiRilevanti = await prisma.conto.findMany({
      where: { isRilevantePerCommesse: true },
      select: { id: true, codice: true },
    });

    if (contiRilevanti.length === 0) {
      console.log('[Recon] Nessun conto marcato come rilevante per le commesse. Processo terminato.');
      return res.status(200).json({
        message: 'Nessun conto rilevante per le commesse è stato configurato.',
        summary: { totalRowsToProcess: 0, reconciledAutomatically: 0, needsManualReconciliation: 0 },
        errors: [],
      });
    }
    const codiciContiRilevanti = contiRilevanti.map(c => c.codice).filter((c): c is string => !!c);
    const contoCodiceToIdMap = new Map(contiRilevanti.map(c => [c.codice, c.id]));
    console.log(`[Recon] Trovati ${codiciContiRilevanti.length} conti rilevanti.`);

    // Trova le righe di staging che usano questi conti
    const righeRilevanti = await prisma.stagingRigaContabile.findMany({
      where: { conto: { in: codiciContiRilevanti } },
    });

    if (righeRilevanti.length === 0) {
        console.log('[Recon] Nessuna riga di staging trovata per i conti rilevanti. Processo terminato.');
        return res.status(200).json({
          message: 'Nessuna riga di staging da processare per i conti rilevanti.',
          summary: { totalRowsToProcess: 0, reconciledAutomatically: 0, needsManualReconciliation: 0 },
          errors: [],
        });
    }
    console.log(`[Recon] Trovate ${righeRilevanti.length} righe di staging da processare.`);
    
    // Recupera gli ID univoci delle testate
    const idTestateDaProcessare = [...new Set(righeRilevanti.map(r => r.codiceUnivocoScaricamento))];
    console.log(`[Recon] Le righe appartengono a ${idTestateDaProcessare.length} scritture uniche.`);

    // Fase 2: Tentativo di riconciliazione automatica (Livello 1 - MOVANAC)
    console.log('[Recon] Fase 2: Tentativo di riconciliazione automatica (MOVANAC)');
    const allocazioniStaging = await prisma.stagingAllocazione.findMany({
      where: { codiceUnivocoScaricamento: { in: idTestateDaProcessare } },
    });
    console.log(`[Recon] Trovate ${allocazioniStaging.length} righe di allocazione nello staging.`);

    let reconciledByMovanacCount = 0;
    const righeDaProcessareLivello2: typeof righeRilevanti = [];

    for (const riga of righeRilevanti) {
      const hasMatchingAllocazione = allocazioniStaging.some(
        alloc => alloc.codiceUnivocoScaricamento === riga.codiceUnivocoScaricamento &&
                 alloc.progressivoNumeroRigoCont === riga.progressivoNumeroRigo
      );

      if (hasMatchingAllocazione) {
        reconciledByMovanacCount++;
      } else {
        righeDaProcessareLivello2.push(riga);
      }
    }
    console.log(`[Recon] Riconciliate automaticamente (MOVANAC): ${reconciledByMovanacCount} righe.`);
    console.log(`[Recon] Righe da processare con Livello 2 (Regole): ${righeDaProcessareLivello2.length} righe.`);

    // Fase 3: Tentativo di riconciliazione automatica (Livello 2 - Regole)
    console.log('[Recon] Fase 3: Tentativo di riconciliazione automatica (Regole)');
    const regoleRipartizione = await prisma.regolaRipartizione.findMany();
    const contiConRegole = new Set(regoleRipartizione.map(r => r.contoId));
    console.log(`[Recon] Trovate ${regoleRipartizione.length} regole di ripartizione, che coprono ${contiConRegole.size} conti unici.`);

    let reconciledByRuleCount = 0;
    const righeDaProcessareManualmente: typeof righeRilevanti = [];

    for (const riga of righeDaProcessareLivello2) {
      const contoId = riga.conto ? contoCodiceToIdMap.get(riga.conto) : undefined;
      if (contoId && contiConRegole.has(contoId)) {
        reconciledByRuleCount++;
      } else {
        righeDaProcessareManualmente.push(riga);
      }
    }
    console.log(`[Recon] Riconciliate automaticamente (Regole): ${reconciledByRuleCount} righe.`);
    console.log(`[Recon] Righe che necessitano di riconciliazione finale: ${righeDaProcessareManualmente.length} righe.`);
    
    // Fase 4: Preparazione per Riconciliazione Manuale con Suggerimenti
    console.log('[Recon] Fase 4: Preparazione per Riconciliazione Manuale');

    const contiConVociAnalitiche = await prisma.conto.findMany({
      where: { id: { in: Array.from(contoCodiceToIdMap.values()) } },
      select: {
        id: true,
        vociAnalitiche: { select: { id: true }, take: 1 }, // Prendiamo solo la prima voce mappata come suggerimento
      },
    });

    const contoToVoceMap = new Map(
      contiConVociAnalitiche.map(c => [c.id, c.vociAnalitiche[0]?.id])
    );
    
    const righePerUI = righeDaProcessareManualmente.map(riga => {
      const contoId = riga.conto ? contoCodiceToIdMap.get(riga.conto) : undefined;
      const suggerimentoVoceId = contoId ? contoToVoceMap.get(contoId) : undefined;
      return {
        ...riga,
        suggerimentoVoceAnaliticaId: suggerimentoVoceId,
      };
    });

    console.log('[Recon] Preparazione dei dati per il frontend completata.');

    
    console.log('Processo di riconciliazione completato.');
    
    const totalReconciledAutomatically = reconciledByMovanacCount + reconciledByRuleCount;

    res.status(200).json({
      message: 'Processo di riconciliazione completato con successo.',
      summary: {
        totalScrittureToProcess: idTestateDaProcessare.length,
        totalRigheToProcess: righeRilevanti.length,
        reconciledAutomatically: totalReconciledAutomatically,
        needsManualReconciliation: righeDaProcessareManualmente.length,
      },
      data: righePerUI, // Includiamo i dati per il frontend
      errors: [],
    });
  } catch (error) {
    console.error('Errore durante il processo di riconciliazione:', error);
    res.status(500).json({ 
      message: 'Si è verificato un errore durante la riconciliazione.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});


const allocationSchema = z.object({
  commessaId: z.string(),
  importo: z.number().positive(),
});

const manualAllocationSchema = z.object({
  rigaStagingId: z.string(),
  voceAnaliticaId: z.string(),
  allocazioni: z.array(allocationSchema).min(1),
});

router.post('/manual-allocation', async (req, res) => {
  try {
    const validation = manualAllocationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Dati di input non validi.', details: validation.error.formErrors });
    }

    const { rigaStagingId, voceAnaliticaId, allocazioni } = validation.data;

    const rigaStaging = await prisma.stagingRigaContabile.findUnique({
        where: { id: rigaStagingId },
        include: { testata: true }
    });

    if (!rigaStaging || !rigaStaging.testata) {
        return res.status(404).json({ error: 'Riga di staging non trovata o testata mancante.' });
    }
    
    // TODO: Risolvere il problema di typing di Prisma con le relazioni incluse.
    // Il cast a 'any' è un workaround temporaneo per sbloccare lo sviluppo.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rigaTyped = rigaStaging as any;
    
    const result = await prisma.$transaction(async (tx) => {

      // 1. Upsert Conto (se non esiste, ne crea uno placeholder)
      const conto = await tx.conto.upsert({
        where: { 
          codice_codiceFiscaleAzienda: { 
            codice: rigaTyped.conto ?? 'N/A', 
            codiceFiscaleAzienda: rigaTyped.testata.codiceFiscaleAzienda ?? '' 
          }
        },
        update: {},
        create: {
          codice: rigaTyped.conto ?? 'N/A',
          codiceFiscaleAzienda: rigaTyped.testata.codiceFiscaleAzienda ?? '',
          nome: `Conto placeholder - ${rigaTyped.conto}`,
          tipo: 'Patrimoniale',
          isRilevantePerCommesse: true,
        }
      });

      // 2. Upsert ScritturaContabile
      const scritturaContabile = await tx.scritturaContabile.upsert({
          where: { externalId: rigaTyped.codiceUnivocoScaricamento },
          update: {},
          create: {
              externalId: rigaTyped.codiceUnivocoScaricamento,
              data: new Date(rigaTyped.testata.dataRegistrazione),
              dataDocumento: rigaTyped.testata.dataDocumento ? new Date(rigaTyped.testata.dataDocumento) : undefined,
              numeroDocumento: rigaTyped.testata.numeroDocumento,
              descrizione: `Importata da staging - ${rigaTyped.testata.noteMovimento || rigaTyped.codiceUnivocoScaricamento}`,
              // TODO: Aggiungere lookup per causale e fornitore
          }
      });
      
      // 3. Create RigaScrittura
      const rigaScrittura = await tx.rigaScrittura.create({
          data: {
              scritturaContabileId: scritturaContabile.id,
              contoId: conto.id,
              descrizione: rigaTyped.note ?? '',
              dare: rigaTyped.importoDare ? parseFloat(rigaTyped.importoDare) : 0,
              avere: rigaTyped.importoAvere ? parseFloat(rigaTyped.importoAvere) : 0,
          }
      });

      // 4. Create Allocazioni
      const createdAllocations = await tx.allocazione.createMany({
        data: allocazioni.map(alloc => ({
          rigaScritturaId: rigaScrittura.id,
          voceAnaliticaId: voceAnaliticaId,
          commessaId: alloc.commessaId,
          importo: alloc.importo,
          tipoMovimento: 'COSTO_EFFETTIVO',
          dataMovimento: new Date(rigaTyped.testata.dataRegistrazione),
        })),
      });

      return { ...createdAllocations, rigaStagingId };
    });

    res.status(201).json({ 
      message: `Allocazione per riga ${rigaStagingId} creata con successo.`,
      data: result,
    });

  } catch (error) {
    console.error('Errore durante la creazione dell\'allocazione manuale:', error);
    res.status(500).json({ 
      message: 'Si è verificato un errore durante il salvataggio.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router; 