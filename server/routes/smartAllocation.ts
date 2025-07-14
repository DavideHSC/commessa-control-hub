import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// POST /api/smart-allocation/analyze-patterns - Analizza pattern storici
router.post('/analyze-patterns', async (req, res) => {
    try {
        console.log('[SmartAllocation] Avvio analisi pattern storici...');

        // STEP 1: Analizza fornitori ricorrenti
        const fornitoriPattern = await analyzeFornitoriPatterns();
        
        // STEP 2: Analizza pattern di allocazione per conto
        const contiiPattern = await analyzeContiPatterns();
        
        // STEP 3: Analizza pattern temporali
        const temporalPattern = await analyzeTemporalPatterns();

        // STEP 4: Genera suggerimenti intelligenti
        const suggestions = await generateSmartSuggestions();

        const analysisResult = {
            fornitori: fornitoriPattern,
            conti: contiiPattern,
            temporal: temporalPattern,
            suggestions,
            timestamp: new Date()
        };

        res.json(analysisResult);

    } catch (error) {
        console.error('[SmartAllocation] Errore durante l\'analisi pattern:', error);
        res.status(500).json({ 
            error: 'Errore durante l\'analisi dei pattern',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
});

// POST /api/smart-allocation/suggest - Suggerisce allocazioni per una riga specifica
router.post('/suggest', async (req, res) => {
    try {
        const { rigaId, contoId, importo, descrizione } = req.body;

        console.log(`[SmartAllocation] Generazione suggerimenti per riga ${rigaId}...`);

        // STEP 1: Trova allocazioni simili storiche
        const allocazioniSimili = await findSimilarAllocations(contoId, descrizione, importo);

        // STEP 2: Applica regole di ripartizione esistenti
        const regoleSuggerite = await applyExistingRules(contoId);

        // STEP 3: Analizza pattern fornitore (se disponibile)
        const fornitorePattern = await analyzeFornitorePattern(descrizione);

        // STEP 4: Genera suggerimenti finali
        const suggestions = await generateFinalSuggestions(
            allocazioniSimili,
            regoleSuggerite,
            fornitorePattern,
            importo
        );

        res.json({
            rigaId,
            suggestions,
            confidence: calculateConfidenceScore(suggestions),
            reasoning: generateReasoningText(suggestions)
        });

    } catch (error) {
        console.error('[SmartAllocation] Errore durante la generazione suggerimenti:', error);
        res.status(500).json({ 
            error: 'Errore durante la generazione dei suggerimenti',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
});

// POST /api/smart-allocation/validate - Valida un'allocazione proposta
router.post('/validate', async (req, res) => {
    try {
        const { allocazioni, rigaId } = req.body;

        console.log(`[SmartAllocation] Validazione allocazione per riga ${rigaId}...`);

        const validationResult = await validateAllocation(allocazioni, rigaId);

        res.json(validationResult);

    } catch (error) {
        console.error('[SmartAllocation] Errore durante la validazione:', error);
        res.status(500).json({ 
            error: 'Errore durante la validazione',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
});

// POST /api/smart-allocation/learn - Apprende da nuove allocazioni
router.post('/learn', async (req, res) => {
    try {
        const { allocazioni, rigaId } = req.body;

        console.log(`[SmartAllocation] Apprendimento da nuova allocazione ${rigaId}...`);

        // Crea o aggiorna pattern basati sulla nuova allocazione
        await learnFromAllocation(allocazioni, rigaId);

        res.json({
            message: 'Apprendimento completato',
            rigaId,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('[SmartAllocation] Errore durante l\'apprendimento:', error);
        res.status(500).json({ 
            error: 'Errore durante l\'apprendimento',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
});

// ==============================
// FUNZIONI HELPER
// ==============================

// Analizza pattern dei fornitori ricorrenti
async function analyzeFornitoriPatterns() {
    const fornitori = await prisma.fornitore.findMany({
        include: {
            _count: {
                select: {
                    righeScrittura: true
                }
            }
        }
    });

    return fornitori
        .filter(f => f._count.righeScrittura > 5) // Solo fornitori con > 5 movimenti
        .map(f => ({
            id: f.id,
            nome: f.nome,
            movimenti: f._count.righeScrittura,
            frequency: 'high' // TODO: Calcolare frequenza reale
        }));
}

// Analizza pattern di allocazione per conto
async function analyzeContiPatterns() {
    const conti = await prisma.conto.findMany({
        include: {
            righeScrittura: {
                include: {
                    allocazioni: {
                        include: {
                            commessa: true,
                            voceAnalitica: true
                        }
                    }
                }
            }
        }
    });

    return conti
        .filter(c => c.righeScrittura.length > 0)
        .map(c => {
            const allocazioni = c.righeScrittura.flatMap(r => r.allocazioni);
            const commesseFrequenti = getFrequentCommesse(allocazioni);
            
            return {
                contoId: c.id,
                nome: c.nome,
                totalMovimenti: c.righeScrittura.length,
                commesseFrequenti,
                pattern: 'regular' // TODO: Calcolare pattern reale
            };
        });
}

// Analizza pattern temporali
async function analyzeTemporalPatterns() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const allocazioni = await prisma.allocazione.findMany({
        where: {
            dataMovimento: {
                gte: lastMonth
            }
        },
        include: {
            commessa: true,
            voceAnalitica: true
        }
    });

    return {
        totalAllocazioni: allocazioni.length,
        commessePiuAttive: getMostActiveCommesse(allocazioni),
        vociPiuUsate: getMostUsedVoci(allocazioni),
        trend: 'stable' // TODO: Calcolare trend reale
    };
}

// Genera suggerimenti intelligenti basati sui pattern
async function generateSmartSuggestions() {
    const regoleAttive = await prisma.regolaRipartizione.findMany({
        include: {
            conto: true,
            commessa: true,
            voceAnalitica: true
        }
    });

    return regoleAttive.map(r => ({
        type: 'automatic_rule',
        contoId: r.contoId,
        commessaId: r.commessaId,
        voceAnaliticaId: r.voceAnaliticaId,
        percentuale: r.percentuale,
        confidence: 0.9,
        reasoning: `Regola automatica: ${r.descrizione}`
    }));
}

// Trova allocazioni simili storiche
async function findSimilarAllocations(contoId: string, descrizione: string, importo: number) {
    const allocazioni = await prisma.allocazione.findMany({
        where: {
            rigaScrittura: {
                contoId: contoId
            }
        },
        include: {
            commessa: true,
            voceAnalitica: true,
            rigaScrittura: true
        },
        orderBy: {
            dataMovimento: 'desc'
        },
        take: 10
    });

    return allocazioni.map(a => ({
        commessaId: a.commessaId,
        voceAnaliticaId: a.voceAnaliticaId,
        importo: a.importo,
        similarity: calculateSimilarity(descrizione, a.note || ''),
        confidence: 0.7
    }));
}

// Applica regole esistenti
async function applyExistingRules(contoId: string) {
    const regole = await prisma.regolaRipartizione.findMany({
        where: { contoId },
        include: {
            commessa: true,
            voceAnalitica: true
        }
    });

    return regole.map(r => ({
        commessaId: r.commessaId,
        voceAnaliticaId: r.voceAnaliticaId,
        percentuale: r.percentuale,
        confidence: 0.95,
        reasoning: `Regola configurata: ${r.descrizione}`
    }));
}

// Analizza pattern fornitore
async function analyzeFornitorePattern(descrizione: string) {
    // TODO: Implementare NLP per estrarre nome fornitore dalla descrizione
    return {
        fornitoreDetected: false,
        suggestions: []
    };
}

// Genera suggerimenti finali
async function generateFinalSuggestions(storiche: any[], regole: any[], fornitore: any, importo: number) {
    const suggestions: any[] = [];

    // Aggiungi regole configurate (priorità alta)
    regole.forEach(r => {
        suggestions.push({
            type: 'rule',
            commessaId: r.commessaId,
            voceAnaliticaId: r.voceAnaliticaId,
            importo: importo * (r.percentuale / 100),
            confidence: r.confidence,
            reasoning: r.reasoning
        });
    });

    // Aggiungi suggerimenti storici (priorità media)
    storiche
        .filter(s => s.similarity > 0.7)
        .slice(0, 3)
        .forEach(s => {
            suggestions.push({
                type: 'historical',
                commessaId: s.commessaId,
                voceAnaliticaId: s.voceAnaliticaId,
                importo: s.importo,
                confidence: s.confidence * s.similarity,
                reasoning: `Allocazione simile precedente (${(s.similarity * 100).toFixed(0)}% compatibilità)`
            });
        });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// Calcola confidence score
function calculateConfidenceScore(suggestions: any[]) {
    if (suggestions.length === 0) return 0;
    return suggestions.reduce((acc, s) => acc + s.confidence, 0) / suggestions.length;
}

// Genera testo di ragionamento
function generateReasoningText(suggestions: any[]) {
    if (suggestions.length === 0) return 'Nessun suggerimento disponibile';
    
    const best = suggestions[0];
    return `Suggerimento principale basato su ${best.type === 'rule' ? 'regola configurata' : 'allocazioni storiche'} con ${(best.confidence * 100).toFixed(0)}% di confidenza`;
}

// Valida allocazione
async function validateAllocation(allocazioni: any[], rigaId: string) {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Verifica che la somma delle allocazioni sia corretta
    const totalAllocato = allocazioni.reduce((sum: number, a: any) => sum + a.importo, 0);
    
    if (totalAllocato <= 0) {
        errors.push('L\'importo totale allocato deve essere positivo');
    }

    // Verifica che tutte le commesse esistano
    for (const alloc of allocazioni) {
        const commessaExists = await prisma.commessa.findUnique({
            where: { id: alloc.commessaId }
        });
        
        if (!commessaExists) {
            errors.push(`Commessa ${alloc.commessaId} non trovata`);
        }
    }

    return {
        isValid: errors.length === 0,
        warnings,
        errors,
        totalAllocato
    };
}

// Apprende da nuove allocazioni
async function learnFromAllocation(allocazioni: any[], rigaId: string) {
    // TODO: Implementare machine learning per migliorare i suggerimenti
    console.log(`[SmartAllocation] Apprendimento da ${allocazioni.length} allocazioni per riga ${rigaId}`);
}

// Utility functions
function getFrequentCommesse(allocazioni: any[]) {
    const commesseCount = allocazioni.reduce((acc: any, a: any) => {
        acc[a.commessa.id] = (acc[a.commessa.id] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(commesseCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([id, count]) => ({ id, count }));
}

function getMostActiveCommesse(allocazioni: any[]) {
    return getFrequentCommesse(allocazioni);
}

function getMostUsedVoci(allocazioni: any[]) {
    const vociCount = allocazioni.reduce((acc: any, a: any) => {
        acc[a.voceAnalitica.id] = (acc[a.voceAnalitica.id] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(vociCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([id, count]) => ({ id, count }));
}

function calculateSimilarity(str1: string, str2: string) {
    // Simple Jaccard similarity
    const set1 = new Set(str1.toLowerCase().split(' '));
    const set2 = new Set(str2.toLowerCase().split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
}

export default router;