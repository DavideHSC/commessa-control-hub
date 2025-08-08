import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ReconciliationResult, ReconciliationSummaryData, RigaDaRiconciliare } from '../types/reconciliation';

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

        righeDaRiconciliare.push({
            id: riga.id,
            externalId: riga.externalId,
            data: riga.testata.dataRegistrazione ? new Date(riga.testata.dataRegistrazione) : new Date(),
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