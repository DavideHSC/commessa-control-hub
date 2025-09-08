import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ReconciliationResult, ReconciliationSummaryData, RigaDaRiconciliare } from '@shared-types/index.js';

const prisma = new PrismaClient();
const router = express.Router();


// POST /api/reconciliation/run - Avvia il processo di riconciliazione
router.post('/run', async (req, res) => {
    try {
        console.log('[Reconciliation] Avvio processo di riconciliazione...');

        // STEP 1: Verifica configurazione conti rilevanti
        const contiRilevanti = await prisma.conto.findMany({
            where: { isRilevantePerCommesse: true },
            select: { id: true, codice: true, nome: true }
        });

        let whereContiFilter: any = {};
        
        if (contiRilevanti.length > 0) {
            // Usa solo i conti marcati come rilevanti
            whereContiFilter = {
                contoId: {
                    in: contiRilevanti.map(c => c.id)
                }
            };
            console.log(`[Reconciliation] Utilizzo ${contiRilevanti.length} conti rilevanti configurati`);
        } else {
            // Fallback: usa tutti i conti
            console.log('[Reconciliation] Nessun conto rilevante configurato, utilizzo tutti i conti');
        }

        // STEP 2: Conta le scritture da processare
        const totalScrittureToProcess = await prisma.stagingTestata.count();
        
        // STEP 3: Conta le righe contabili rilevanti
        const totalRigheToProcess = await prisma.stagingRigaContabile.count();

        // STEP 4: Riconciliazione automatica (MOVANAC + DETTANAL)
        const reconciledAutomatically = await processAutomaticAllocations();

        // STEP 5: Identifica righe che necessitano riconciliazione manuale
        const righeDaRiconciliare = await getRigheDaRiconciliare(whereContiFilter);
        
        const summary: ReconciliationSummaryData = {
            totalScrittureToProcess,
            totalRigheToProcess,
            reconciledAutomatically,
            needsManualReconciliation: righeDaRiconciliare.length
        };

        const result: ReconciliationResult = {
            message: 'Processo di riconciliazione completato',
            summary,
            righeDaRiconciliare,
            errors: []
        };

        res.json(result);

    } catch (error) {
        console.error('[Reconciliation] Errore durante il processo:', error);
        res.status(500).json({ 
            error: 'Errore durante il processo di riconciliazione',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
});

// POST /api/reconciliation/finalize - Finalizza allocazione manuale
router.post('/finalize', async (req, res) => {
    try {
        const { rigaScritturaId, allocations } = req.body;

        console.log(`[Reconciliation] Finalizzazione allocazione per riga ${rigaScritturaId}...`);

        // Verifica che la riga di staging esista
        const rigaStaging = await prisma.stagingRigaContabile.findUnique({
            where: { id: rigaScritturaId }
        });

        if (!rigaStaging) {
            return res.status(404).json({ error: 'Riga di staging non trovata' });
        }

        // STEP 1: Crea la riga scrittura definitiva (se non esiste)
        const rigaScrittura = await prisma.rigaScrittura.create({
            data: {
                descrizione: rigaStaging.note || 'Movimento da riconciliazione',
                dare: parseFloat(rigaStaging.importoDare || '0'),
                avere: parseFloat(rigaStaging.importoAvere || '0'),
                scritturaContabile: {
                    create: {
                        data: new Date(), // TODO: Usare data reale dal staging
                        descrizione: rigaStaging.note || 'Scrittura da riconciliazione',
                        numeroDocumento: rigaStaging.externalId
                    }
                }
            }
        });

        // STEP 2: Crea le allocazioni
        const allocazioniCreate = allocations.map((alloc: any) => ({
            importo: alloc.importo,
            tipoMovimento: (rigaScrittura.dare || 0) > 0 ? 'COSTO_EFFETTIVO' : 'RICAVO_EFFETTIVO',
            rigaScritturaId: rigaScrittura.id,
            commessaId: alloc.commessaId,
            voceAnaliticaId: alloc.voceAnaliticaId,
            dataMovimento: new Date()
        }));

        await prisma.allocazione.createMany({
            data: allocazioniCreate
        });

        // STEP 3: Rimuovi la riga di staging (opzionale)
        // await prisma.stagingRigaContabile.delete({
        //     where: { id: rigaScritturaId }
        // });

        console.log(`[Reconciliation] Allocazione finalizzata con successo per riga ${rigaScritturaId}`);

        res.json({
            message: 'Allocazione finalizzata con successo',
            rigaScritturaId: rigaScrittura.id,
            allocationsCount: allocazioniCreate.length
        });

    } catch (error) {
        console.error('[Reconciliation] Errore durante la finalizzazione:', error);
        res.status(500).json({ 
            error: 'Errore durante la finalizzazione dell\'allocazione',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
});

// GET /api/reconciliation/movimenti - Get movements with allocation status
router.get('/movimenti', async (req, res) => {
    try {
        console.log('[Reconciliation] Fetching movimenti with allocation status...');

        // Get finalized movimenti (from actual tables, not staging)
        const movimenti = await prisma.rigaScrittura.findMany({
            include: {
                scritturaContabile: {
                    include: {
                        fornitore: true,
                        causale: true
                    }
                },
                conto: true,
                allocazioni: {
                    include: {
                        commessa: true,
                        voceAnalitica: true
                    }
                }
            },
            orderBy: {
                scritturaContabile: {
                    data: 'desc'
                }
            },
            take: 100 // Limit for performance
        });

        // Transform to MovimentoContabile format
        const movimentiTransformed = movimenti.map(riga => {
            const importoTotale = Math.abs((riga.dare || 0) - (riga.avere || 0));
            const importoAllocato = riga.allocazioni.reduce((sum, alloc) => sum + Math.abs(alloc.importo), 0);
            const importoResiduo = importoTotale - importoAllocato;
            
            // Determine allocation status
            let stato: 'non_allocato' | 'parzialmente_allocato' | 'completamente_allocato';
            if (importoAllocato === 0) {
                stato = 'non_allocato';
            } else if (Math.abs(importoResiduo) < 0.01) {
                stato = 'completamente_allocato';
            } else {
                stato = 'parzialmente_allocato';
            }

            return {
                id: riga.id,
                numeroDocumento: riga.scritturaContabile.numeroDocumento || riga.scritturaContabile.externalId || 'N/A',
                dataDocumento: riga.scritturaContabile.data ? riga.scritturaContabile.data.toISOString() : new Date().toISOString(),
                descrizione: riga.descrizione || riga.scritturaContabile.descrizione || 'Movimento contabile',
                importo: (riga.dare || 0) - (riga.avere || 0), // Keep sign for display
                conto: riga.conto ? {
                    codice: riga.conto.codice,
                    nome: riga.conto.nome
                } : null,
                cliente: null, // TODO: Add if needed
                fornitore: riga.scritturaContabile.fornitore ? {
                    nome: riga.scritturaContabile.fornitore.nome
                } : null,
                causale: riga.scritturaContabile.causale ? {
                    descrizione: riga.scritturaContabile.causale.descrizione
                } : null,
                allocazioni: riga.allocazioni.map(alloc => ({
                    id: alloc.id,
                    commessaId: alloc.commessaId,
                    voceAnaliticaId: alloc.voceAnaliticaId,
                    importo: alloc.importo,
                    percentuale: importoTotale > 0 ? Math.round((Math.abs(alloc.importo) / importoTotale) * 100) : 0,
                    commessa: { nome: alloc.commessa.nome },
                    voceAnalitica: { nome: alloc.voceAnalitica.nome }
                })),
                importoAllocato,
                importoResiduo,
                stato
            };
        });

        res.json({
            data: movimentiTransformed,
            total: movimentiTransformed.length
        });

    } catch (error) {
        console.error('[Reconciliation] Error fetching movimenti:', error);
        res.status(500).json({ 
            error: 'Errore durante il recupero dei movimenti',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
});

// POST /api/reconciliation/allocate/:rigaId - Create allocation for specific movement
router.post('/allocate/:rigaId', async (req, res) => {
    try {
        const { rigaId } = req.params;
        const { allocazioni } = req.body;

        console.log(`[Reconciliation] Creating allocations for riga ${rigaId}...`);

        if (!allocazioni || !Array.isArray(allocazioni) || allocazioni.length === 0) {
            return res.status(400).json({ error: 'Allocazioni richieste' });
        }

        // Verify the riga exists
        const rigaScrittura = await prisma.rigaScrittura.findUnique({
            where: { id: rigaId },
            include: { scritturaContabile: true }
        });

        if (!rigaScrittura) {
            return res.status(404).json({ error: 'Riga scrittura non trovata' });
        }

        // Delete existing allocations for this riga
        await prisma.allocazione.deleteMany({
            where: { rigaScritturaId: rigaId }
        });

        // Create new allocations
        const allocazioniData = allocazioni.map((alloc: any) => ({
            importo: Math.abs(Number(alloc.importo)),
            tipoMovimento: (rigaScrittura.dare || 0) > 0 ? 'COSTO_EFFETTIVO' : 'RICAVO_EFFETTIVO',
            rigaScritturaId: rigaId,
            commessaId: alloc.commessaId,
            voceAnaliticaId: alloc.voceAnaliticaId,
            dataMovimento: rigaScrittura.scritturaContabile.data,
            note: `Allocazione manuale ${alloc.percentuale || 100}%`
        }));

        const newAllocazioni = await prisma.allocazione.createMany({
            data: allocazioniData
        });

        console.log(`[Reconciliation] Created ${newAllocazioni.count} allocations for riga ${rigaId}`);

        res.json({
            message: 'Allocazioni create con successo',
            rigaScritturaId: rigaId,
            allocationsCount: newAllocazioni.count
        });

    } catch (error) {
        console.error('[Reconciliation] Error creating allocations:', error);
        res.status(500).json({ 
            error: 'Errore durante la creazione delle allocazioni',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
});

// Funzione helper per ottenere le righe da riconciliare
async function getRigheDaRiconciliare(whereContiFilter: any): Promise<RigaDaRiconciliare[]> {
    // Query per ottenere le righe contabili di staging che necessitano riconciliazione
    const righeStaging = await prisma.stagingRigaContabile.findMany({
        include: {
            testata: true
        },
        // Limita ai primi 100 per performance
        take: 100
    });

    // Convertiamo in formato atteso dall'interfaccia
    const righeDaRiconciliare: RigaDaRiconciliare[] = [];

    for (const riga of righeStaging) {
        // Verifica se questa riga è già stata processata automaticamente
        const esisteAllocazione = await prisma.allocazione.findFirst({
            where: {
                rigaScrittura: {
                    scritturaContabile: {
                        numeroDocumento: riga.externalId
                    }
                }
            }
        });

        // Se esiste già un'allocazione, salta questa riga
        if (esisteAllocazione) continue;

        // Trova il conto corrispondente
        const conto = await prisma.conto.findFirst({
            where: {
                OR: [
                    { codice: riga.conto },
                    { nome: { contains: riga.conto, mode: 'insensitive' } }
                ]
            }
        });

        if (!conto) continue;

        // Applica filtro conti rilevanti se specificato
        if (whereContiFilter.contoId && !whereContiFilter.contoId.in.includes(conto.id)) {
            continue;
        }

        // Suggerisci voce analitica basata sulla configurazione
        const voceAnaliticaSuggerita = await prisma.voceAnalitica.findFirst({
            where: {
                conti: {
                    some: {
                        id: conto.id
                    }
                }
            }
        });

        // Genera suggerimenti intelligenti per questa riga
        const smartSuggestions = await generateSmartSuggestionsForRiga(riga, conto);

        const importo = Math.abs(parseFloat(riga.importoDare || '0') - parseFloat(riga.importoAvere || '0'));

        // Fix date parsing - handle different formats from staging data
        let dataMovimento = new Date();
        if (riga.testata.dataRegistrazione) {
            try {
                // Try to parse date - could be string format like "20250101" or ISO
                const dateStr = riga.testata.dataRegistrazione.toString().trim();
                
                if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
                    // Format YYYYMMDD
                    const year = parseInt(dateStr.substring(0, 4));
                    const month = parseInt(dateStr.substring(4, 6));
                    const day = parseInt(dateStr.substring(6, 8));
                    
                    // Validate date components
                    if (year >= 2000 && year <= 2050 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                        dataMovimento = new Date(year, month - 1, day); // Month is 0-based in JS
                    } else {
                        throw new Error(`Invalid date components: ${year}-${month}-${day}`);
                    }
                } else if (dateStr.length === 6 && /^\d{6}$/.test(dateStr)) {
                    // Format DDMMYY or YYMMDD - assume DDMMYY
                    const day = parseInt(dateStr.substring(0, 2));
                    const month = parseInt(dateStr.substring(2, 4));
                    const year = parseInt(dateStr.substring(4, 6)) + 2000; // Assume 20xx
                    
                    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
                        dataMovimento = new Date(year, month - 1, day);
                    } else {
                        throw new Error(`Invalid date components: ${day}-${month}-${year}`);
                    }
                } else if (dateStr.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                    // Format DD/MM/YYYY 
                    const [day, month, year] = dateStr.split('/').map(Number);
                    if (year >= 2000 && year <= 2050 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                        dataMovimento = new Date(year, month - 1, day);
                    } else {
                        throw new Error(`Invalid date components: ${day}/${month}/${year}`);
                    }
                } else {
                    // Try normal date parsing as fallback
                    const parsed = new Date(dateStr);
                    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2000 && parsed.getFullYear() <= 2050) {
                        dataMovimento = parsed;
                    } else {
                        throw new Error(`Date parsing failed for: ${dateStr}`);
                    }
                }
            } catch (error) {
                console.warn(`[Reconciliation] Invalid date format for ${riga.id}: ${riga.testata.dataRegistrazione} - ${error.message}`);
                // Fall back to testata creation date or a reasonable default
                if (riga.testata.createdAt) {
                    dataMovimento = new Date(riga.testata.createdAt);
                } else {
                    // Use a reasonable default date instead of current date
                    dataMovimento = new Date('2025-01-01');
                }
            }
        } else {
            // No date provided, use creation date or reasonable default
            if (riga.testata.createdAt) {
                dataMovimento = new Date(riga.testata.createdAt);
            } else {
                dataMovimento = new Date('2025-01-01');
            }
        }

        righeDaRiconciliare.push({
            id: riga.id,
            externalId: riga.externalId,
            data: dataMovimento,
            descrizione: riga.note || 'Movimento contabile',
            importo,
            conto: {
                id: conto.id,
                codice: conto.codice,
                nome: conto.nome
            },
            voceAnaliticaSuggerita: voceAnaliticaSuggerita ? {
                id: voceAnaliticaSuggerita.id,
                nome: voceAnaliticaSuggerita.nome
            } : null
        });
    }

    return righeDaRiconciliare;
}

// Funzione per processare allocazioni automatiche MOVANAC + DETTANAL
async function processAutomaticAllocations(): Promise<number> {
    let reconciledCount = 0;

    try {
        // STEP 1: Processa allocazioni MOVANAC (pre-definite)
        const stagingAllocazioni = await prisma.stagingAllocazione.findMany({
            where: {
                centroDiCosto: { not: null },
                progressivoRigoContabile: { not: null }
            }
        });

        console.log(`[Reconciliation] Trovate ${stagingAllocazioni.length} allocazioni MOVANAC`);

        for (const allocazione of stagingAllocazioni) {
            try {
                // Trova la riga contabile corrispondente
                const rigaContabile = await prisma.stagingRigaContabile.findFirst({
                    where: {
                        progressivoRigo: allocazione.progressivoRigoContabile || '',
                        codiceUnivocoScaricamento: allocazione.codiceUnivocoScaricamento || ''
                    }
                });

                if (!rigaContabile) continue;

                // Trova la commessa per centro di costo
                const commessa = await prisma.commessa.findFirst({
                    where: {
                        OR: [
                            { nome: { contains: allocazione.centroDiCosto || '', mode: 'insensitive' } },
                            { descrizione: { contains: allocazione.centroDiCosto || '', mode: 'insensitive' } }
                        ]
                    }
                });

                if (!commessa) continue;

                // Trova voce analitica suggerita
                const voceAnalitica = await prisma.voceAnalitica.findFirst();

                if (!voceAnalitica) continue;

                // Crea scrittura e allocazione automatica
                const rigaScrittura = await prisma.rigaScrittura.create({
                    data: {
                        descrizione: rigaContabile.note || 'Allocazione automatica MOVANAC',
                        dare: parseFloat(rigaContabile.importoDare || '0'),
                        avere: parseFloat(rigaContabile.importoAvere || '0'),
                        scritturaContabile: {
                            create: {
                                data: new Date(),
                                descrizione: 'Allocazione automatica MOVANAC',
                                numeroDocumento: rigaContabile.externalId
                            }
                        }
                    }
                });

                await prisma.allocazione.create({
                    data: {
                        importo: Math.abs(parseFloat(rigaContabile.importoDare || '0') - parseFloat(rigaContabile.importoAvere || '0')),
                        tipoMovimento: parseFloat(rigaContabile.importoDare || '0') > 0 ? 'COSTO_EFFETTIVO' : 'RICAVO_EFFETTIVO',
                        rigaScritturaId: rigaScrittura.id,
                        commessaId: commessa.id,
                        voceAnaliticaId: voceAnalitica.id,
                        dataMovimento: new Date(),
                        note: `Allocazione automatica MOVANAC: ${allocazione.centroDiCosto}`
                    }
                });

                reconciledCount++;
                console.log(`[Reconciliation] Allocazione MOVANAC creata per riga ${rigaContabile.id} -> commessa ${commessa.nome}`);

            } catch (error) {
                console.error(`[Reconciliation] Errore processando allocazione MOVANAC:`, error);
            }
        }

        // STEP 2: Processa regole DETTANAL automatiche
        const regoleAttive = await prisma.regolaRipartizione.findMany({
            include: {
                conto: true,
                commessa: true,
                voceAnalitica: true
            }
        });

        console.log(`[Reconciliation] Trovate ${regoleAttive.length} regole DETTANAL attive`);

        for (const regola of regoleAttive) {
            try {
                // Trova righe contabili che matchano questa regola
                const righeMatch = await prisma.stagingRigaContabile.findMany({
                    where: {
                        conto: regola.conto.codice || ''
                    },
                    take: 10 // Limita per performance
                });

                for (const riga of righeMatch) {
                    // Verifica se già processata
                    const esisteAllocazione = await prisma.allocazione.findFirst({
                        where: {
                            rigaScrittura: {
                                scritturaContabile: {
                                    numeroDocumento: riga.externalId
                                }
                            }
                        }
                    });

                    if (esisteAllocazione) continue;

                    // Crea allocazione automatica basata su regola
                    const importoTotale = Math.abs(parseFloat(riga.importoDare || '0') - parseFloat(riga.importoAvere || '0'));
                    const importoAllocazione = importoTotale * (regola.percentuale / 100);

                    const rigaScrittura = await prisma.rigaScrittura.create({
                        data: {
                            descrizione: riga.note || 'Allocazione automatica DETTANAL',
                            dare: parseFloat(riga.importoDare || '0'),
                            avere: parseFloat(riga.importoAvere || '0'),
                            scritturaContabile: {
                                create: {
                                    data: new Date(),
                                    descrizione: 'Allocazione automatica DETTANAL',
                                    numeroDocumento: riga.externalId
                                }
                            }
                        }
                    });

                    await prisma.allocazione.create({
                        data: {
                            importo: importoAllocazione,
                            tipoMovimento: parseFloat(riga.importoDare || '0') > 0 ? 'COSTO_EFFETTIVO' : 'RICAVO_EFFETTIVO',
                            rigaScritturaId: rigaScrittura.id,
                            commessaId: regola.commessaId,
                            voceAnaliticaId: regola.voceAnaliticaId,
                            dataMovimento: new Date(),
                            note: `Allocazione automatica DETTANAL: ${regola.descrizione} (${regola.percentuale}%)`
                        }
                    });

                    reconciledCount++;
                    console.log(`[Reconciliation] Allocazione DETTANAL creata per riga ${riga.id} -> commessa ${regola.commessa.nome}`);
                }

            } catch (error) {
                console.error(`[Reconciliation] Errore processando regola DETTANAL:`, error);
            }
        }

        console.log(`[Reconciliation] Riconciliazione automatica completata: ${reconciledCount} allocazioni create`);
        return reconciledCount;

    } catch (error) {
        console.error('[Reconciliation] Errore durante la riconciliazione automatica:', error);
        return 0;
    }
}

// Funzione helper per generare suggerimenti intelligenti
async function generateSmartSuggestionsForRiga(riga: any, conto: any) {
    try {
        // Analizza allocazioni storiche simili
        const allocazioniStoriche = await prisma.allocazione.findMany({
            where: {
                rigaScrittura: {
                    contoId: conto.id
                }
            },
            include: {
                commessa: true,
                voceAnalitica: true
            },
            orderBy: {
                dataMovimento: 'desc'
            },
            take: 5
        });

        // Trova regole di ripartizione applicabili
        const regoleApplicabili = await prisma.regolaRipartizione.findMany({
            where: {
                contoId: conto.id
            },
            include: {
                commessa: true,
                voceAnalitica: true
            }
        });

        // Calcola pattern di frequenza
        const commesseFrequenti = allocazioniStoriche.reduce((acc: any, a: any) => {
            acc[a.commessa.id] = (acc[a.commessa.id] || 0) + 1;
            return acc;
        }, {});

        // Genera suggerimenti finali
        const suggestions: any[] = [];

        // Aggiungi regole configurate (priorità alta)
        regoleApplicabili.forEach(regola => {
            suggestions.push({
                type: 'rule',
                commessaId: regola.commessaId,
                commessaNome: regola.commessa.nome,
                voceAnaliticaId: regola.voceAnaliticaId,
                voceAnaliticaNome: regola.voceAnalitica.nome,
                percentuale: regola.percentuale,
                confidence: 0.95,
                reasoning: `Regola configurata: ${regola.descrizione}`
            });
        });

        // Aggiungi suggerimenti storici (priorità media)
        const commessePiuFrequenti = Object.entries(commesseFrequenti)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 3);

        for (const [commessaId, count] of commessePiuFrequenti) {
            const allocazione = allocazioniStoriche.find(a => a.commessa.id === commessaId);
            if (allocazione && (count as number) >= 2) {
                suggestions.push({
                    type: 'historical',
                    commessaId: allocazione.commessa.id,
                    commessaNome: allocazione.commessa.nome,
                    voceAnaliticaId: allocazione.voceAnalitica.id,
                    voceAnaliticaNome: allocazione.voceAnalitica.nome,
                    frequency: count,
                    confidence: Math.min(0.8, (count as number) / 10),
                    reasoning: `Usato ${count} volte in passato per questo conto`
                });
            }
        }

        return suggestions.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
        console.error('[SmartSuggestions] Errore generazione suggerimenti:', error);
        return [];
    }
}

export default router;