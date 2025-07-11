import { Router } from 'express';
import { Conto, PrismaClient, VoceAnalitica, Prisma, TipoMovimentoAnalitico } from '@prisma/client';
import { z } from 'zod';
import { ReconciliationResult, RigaDaRiconciliare } from '../types/reconciliation';

const router = Router();
const prisma = new PrismaClient();

// Definiamo un tipo per le righe con la testata inclusa
type StagingRigaContabileWithTestata = Prisma.StagingRigaContabileGetPayload<{
  include: { testata: true }
}>;

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
    });

    if (contiRilevanti.length === 0) {
      console.log('[Recon] Nessun conto marcato come rilevante per le commesse. Processo terminato.');
      return res.status(200).json({
        message: 'Nessun conto rilevante per le commesse è stato configurato.',
        summary: { totalScrittureToProcess: 0, totalRigheToProcess: 0, reconciledAutomatically: 0, needsManualReconciliation: 0 },
        righeDaRiconciliare: [],
        errors: [],
      });
    }
    const contiRilevantiMap = new Map<string, Conto>(contiRilevanti.map(c => [c.id, c]));
    const codiciContiRilevanti = contiRilevanti.map(c => c.codice).filter((c): c is string => !!c);
    const contoCodiceToIdMap = new Map(contiRilevanti.map(c => [c.codice, c.id]));
    console.log(`[Recon] Trovati ${codiciContiRilevanti.length} conti rilevanti.`);

    // Trova le righe di staging che usano questi conti
    const righeRilevanti: StagingRigaContabileWithTestata[] = await prisma.stagingRigaContabile.findMany({
      where: { conto: { in: codiciContiRilevanti } },
      include: {
        testata: true, // Includiamo la testata per avere la data e altre info
      }
    });

    if (righeRilevanti.length === 0) {
        console.log('[Recon] Nessuna riga di staging trovata per i conti rilevanti. Processo terminato.');
        return res.status(200).json({
          message: 'Nessuna riga di staging da processare per i conti rilevanti.',
          summary: { totalScrittureToProcess: 0, totalRigheToProcess: 0, reconciledAutomatically: 0, needsManualReconciliation: 0 },
          righeDaRiconciliare: [],
          errors: [],
        });
    }
    console.log(`[Recon] Trovate ${righeRilevanti.length} righe di staging da processare.`);
    
    // Recupera gli ID univoci delle testate
    const idTestateDaProcessare = Array.from(new Set(righeRilevanti.map(r => r.codiceUnivocoScaricamento)));
    console.log(`[Recon] Le righe appartengono a ${idTestateDaProcessare.length} scritture uniche.`);

    // Fase 2: Tentativo di riconciliazione automatica (Livello 1 - MOVANAC)
    console.log('[Recon] Fase 2: Tentativo di riconciliazione automatica (MOVANAC)');
    const allocazioniStaging = await prisma.stagingAllocazione.findMany({
      where: { codiceUnivocoScaricamento: { in: idTestateDaProcessare } },
    });
    console.log(`[Recon] Trovate ${allocazioniStaging.length} righe di allocazione nello staging.`);

    let reconciledByMovanacCount = 0;
    const righeDaProcessareLivello2: StagingRigaContabileWithTestata[] = [];

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
    const righeDaProcessareManualmente: StagingRigaContabileWithTestata[] = [];

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
        vociAnalitiche: { select: { id: true, nome: true }, take: 1 }, // Prendiamo solo la prima voce mappata come suggerimento
      },
    });

    const contoToVoceMap = new Map(
      contiConVociAnalitiche.map(c => [c.id, c.vociAnalitiche[0]])
    );
    
    const righeDaRiconciliare: RigaDaRiconciliare[] = righeDaProcessareManualmente.map(riga => {
      const contoId = riga.conto ? contoCodiceToIdMap.get(riga.conto) : undefined;
      const conto = contoId ? contiRilevantiMap.get(contoId) : undefined;
      const suggerimentoVoce = contoId ? contoToVoceMap.get(contoId) : undefined;
      
      const importoDare = riga.importoDare ? parseFloat(riga.importoDare) : 0;
      const importoAvere = riga.importoAvere ? parseFloat(riga.importoAvere) : 0;
      const importo = importoDare > 0 ? importoDare : importoAvere;

      return {
        id: riga.id,
        externalId: riga.codiceUnivocoScaricamento,
        data: riga.testata.dataRegistrazione ? new Date(riga.testata.dataRegistrazione) : new Date(),
        descrizione: riga.note || riga.testata.noteMovimento || 'Nessuna descrizione',
        importo: importo,
        conto: {
          id: conto?.id || '',
          codice: conto?.codice || riga.conto,
          nome: conto?.nome || 'Conto non trovato',
        },
        voceAnaliticaSuggerita: suggerimentoVoce ? {
          id: suggerimentoVoce.id,
          nome: suggerimentoVoce.nome,
        } : null,
      };
    });

    console.log('[Recon] Preparazione dei dati per il frontend completata.');

    
    console.log('Processo di riconciliazione completato.');
    
    const totalReconciledAutomatically = reconciledByMovanacCount + reconciledByRuleCount;

    const result: ReconciliationResult = {
      message: 'Processo di riconciliazione completato con successo.',
      summary: {
        totalScrittureToProcess: idTestateDaProcessare.length,
        totalRigheToProcess: righeRilevanti.length,
        reconciledAutomatically: totalReconciledAutomatically,
        needsManualReconciliation: righeDaProcessareManualmente.length,
      },
      righeDaRiconciliare: righeDaRiconciliare,
      errors: [],
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Errore durante il processo di riconciliazione:', error);
    res.status(500).json({ 
      message: 'Si è verificato un errore durante la riconciliazione.',
      summary: { totalScrittureToProcess: 0, totalRigheToProcess: 0, reconciledAutomatically: 0, needsManualReconciliation: 0 },
      righeDaRiconciliare: [],
      error: error instanceof Error ? error.message : String(error),
    });
  }
});


/**
 * Finalizza l'importazione del piano dei conti, trasferendo i dati
 * dalla tabella di staging alla tabella di produzione.
 * Questo approccio "delete-and-recreate" garantisce che la tabella
 * finale rifletta esattamente l'ultimo import.
 */
router.post('/finalize-conti', async (req, res) => {
    console.log('[Finalize Conti] Avvio finalizzazione piano dei conti...');
    try {
        const stagingConti = await prisma.stagingConto.findMany();

        if (stagingConti.length === 0) {
            console.log('[Finalize Conti] Nessun conto in staging da finalizzare.');
            return res.status(200).json({ message: 'Nessun conto in staging da importare.' });
        }

        const contiToCreate = stagingConti.map(sc => {
            let tipoConto: 'Costo' | 'Ricavo' | 'Patrimoniale' | 'Economico' | 'Fornitore' | 'Cliente' | 'Ordine';

            if (sc.gruppo === 'C') {
                tipoConto = 'Costo';
            } else if (sc.gruppo === 'R') {
                tipoConto = 'Ricavo';
            } else {
                switch (sc.tipo) {
                    case 'P': tipoConto = 'Patrimoniale'; break;
                    case 'E': tipoConto = 'Economico'; break;
                    case 'F': tipoConto = 'Fornitore'; break;
                    case 'C': tipoConto = 'Cliente'; break;
                    case 'O': tipoConto = 'Ordine'; break;
                    default: tipoConto = 'Patrimoniale';
                }
            }

            return {
                codice: sc.codice,
                nome: sc.descrizione ?? 'Senza nome',
                tipo: tipoConto,
                codiceFiscaleAzienda: sc.codiceFiscaleAzienda ?? '',
                descrizioneLocale: sc.descrizioneLocale,
                subcodiceAzienda: sc.subcodiceAzienda,
                livello: sc.livello,
                sigla: sc.sigla,
                gruppo: sc.gruppo,
                controlloSegno: sc.controlloSegno,
                utilizzaDescrizioneLocale: sc.utilizzaDescrizioneLocale === 'S',
                consideraBilancioSemplificato: sc.consideraNelBilancioSemplificato === 'S',
                validoImpresaOrdinaria: sc.validoImpresaOrdinaria === 'S',
                validoImpresaSemplificata: sc.validoImpresaSemplificata === 'S',
                validoProfessionistaOrdinario: sc.validoProfessionistaOrdinario === 'S',
                validoProfessionistaSemplificato: sc.validoProfessionistaSemplificato === 'S',
                validoUnicoPf: sc.validoUnicoPf === 'S',
                validoUnicoSp: sc.validoUnicoSp === 'S',
                validoUnicoSc: sc.validoUnicoSc === 'S',
                validoUnicoEnc: sc.validoUnicoEnc === 'S',
                tabellaItalstudio: sc.tabellaItalstudio,
                classeIrpefIres: sc.codiceClasseIrpefIres,
                classeIrap: sc.codiceClasseIrap,
                classeProfessionista: sc.codiceClasseProfessionista,
                classeIrapProfessionista: sc.codiceClasseIrapProfessionista,
                classeIva: sc.codiceClasseIva,
                contoCostiRicavi: sc.contoCostiRicaviCollegato,
                contoDareCee: sc.contoDareCee,
                contoAvereCee: sc.contoAvereCee,
                naturaConto: sc.naturaConto,
                gestioneBeniAmmortizzabili: sc.gestioneBeniAmmortizzabili,
                percDeduzioneManutenzione: sc.percDeduzioneManutenzione ? parseFloat(sc.percDeduzioneManutenzione) : null,
                dettaglioClienteFornitore: sc.dettaglioClienteFornitore,
            };
        });

        console.log(`[Finalize Conti] Trovati ${contiToCreate.length} conti da creare.`);
        
        await prisma.$transaction(async (tx) => {
            console.log('[Finalize Conti] Svuotamento tabella Conti di produzione...');
            await tx.conto.deleteMany({});
            console.log('[Finalize Conti] Caricamento nuovi conti...');
            await tx.conto.createMany({
                data: contiToCreate,
            });
        });

        console.log('[Finalize Conti] Finalizzazione completata con successo.');
        res.status(200).json({ message: `Importati con successo ${contiToCreate.length} conti nel piano dei conti di produzione.` });

    } catch (error) {
        console.error('[Finalize Conti] Errore durante la finalizzazione del piano dei conti:', error);
        res.status(500).json({ message: 'Errore durante la finalizzazione del piano dei conti.', error: error instanceof Error ? error.message : String(error) });
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
    
    // Riga tipizzata correttamente con testata inclusa
    const rigaTyped: StagingRigaContabileWithTestata = rigaStaging;
    
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
              data: rigaTyped.testata.dataRegistrazione ? new Date(rigaTyped.testata.dataRegistrazione) : new Date(),
              dataDocumento: rigaTyped.testata.documentoData ? new Date(rigaTyped.testata.documentoData) : undefined,
              numeroDocumento: rigaTyped.testata.documentoNumero,
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
          dataMovimento: rigaTyped.testata.dataRegistrazione ? new Date(rigaTyped.testata.dataRegistrazione) : new Date(),
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

interface FinalizeAllocationPayload {
    rigaScritturaId: string;
    allocations: {
        commessaId: string;
        voceAnaliticaId: string;
        importo: number;
    }[];
}

router.post('/finalize', async (req, res) => {
    const { rigaScritturaId, allocations } = req.body as FinalizeAllocationPayload;

    if (!rigaScritturaId || !allocations || allocations.length === 0) {
        return res.status(400).json({ error: 'Dati di allocazione non validi.' });
    }

    try {
        const rigaScrittura = await prisma.rigaScrittura.findUnique({
            where: { id: rigaScritturaId },
            include: { scritturaContabile: true }
        });

        if (!rigaScrittura) {
            return res.status(404).json({ error: 'Riga scrittura non trovata.' });
        }

        const newAllocations = allocations.map(a => ({
            ...a,
            rigaScritturaId: rigaScritturaId,
            dataMovimento: rigaScrittura.scritturaContabile.data || new Date(),
            tipoMovimento: TipoMovimentoAnalitico.COSTO_EFFETTIVO // O derivare dal conto
        }));

        await prisma.allocazione.createMany({
            data: newAllocations
        });

        // Qui potremmo anche marcare la riga come "riconciliata" se avessimo un flag
        
        res.status(200).json({ message: 'Allocazione salvata con successo.' });
    } catch (error) {
        console.error("Errore nel finalizzare l'allocazione:", error);
        res.status(500).json({ error: 'Errore interno del server.' });
    }
});

export default router; 