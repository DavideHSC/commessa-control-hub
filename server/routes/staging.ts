import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/staging/rows
 * Recupera tutte le testate di importazione dalle tabelle di staging,
 * includendo le righe contabili e le allocazioni suggerite.
 * Questi dati sono destinati ad alimentare la "Scrivania di Riconciliazione".
 */
router.get('/', async (req, res) => {
    try {
        const testate = await prisma.importScritturaTestata.findMany({
            include: {
                righeContabili: { // Nome corretto della relazione
                    include: {
                        allocazioni: true, // Relazione nested corretta
                    },
                },
            },
            orderBy: {
                dataRegistrazione: 'desc',
            }
        });

        res.json(testate);
    } catch (error) {
        console.error("Errore durante il recupero dei dati di staging:", error);
        res.status(500).json({ error: "Impossibile recuperare i dati per la riconciliazione." });
    }
});

/**
 * POST /api/staging/allocations
 * Crea una nuova allocazione manuale per una riga contabile nello staging.
 * Utilizzato dalla scrivania di riconciliazione per aggiungere allocazioni
 * dove il sistema non ha potuto creare un suggerimento automatico.
 */
router.post('/allocations', async (req, res) => {
    const { rigaContabileId, commessaId, importo, voceAnaliticaId } = req.body;

    // Validazione di base
    if (!rigaContabileId || !commessaId || !importo) {
        return res.status(400).json({ error: 'I campi rigaContabileId, commessaId e importo sono obbligatori.' });
    }

    try {
        const newAllocation = await prisma.stagingAllocazione.create({
            data: {
                rigaContabileId,
                commessaId,
                importo: parseFloat(importo),
                voceAnaliticaId,
            },
        });
        res.status(201).json(newAllocation);
    } catch (error) {
        console.error("Errore durante la creazione dell'allocazione di staging:", error);
        res.status(500).json({ error: "Impossibile creare l'allocazione." });
    }
});

/**
 * PUT /api/staging/allocations/:id
 * Modifica un'allocazione di staging esistente.
 */
router.put('/allocations/:id', async (req, res) => {
    const { id } = req.params;
    const { importo, commessaId, voceAnaliticaId } = req.body;

    try {
        const updatedAllocation = await prisma.stagingAllocazione.update({
            where: { id },
            data: {
                importo: importo ? parseFloat(importo) : undefined,
                commessaId,
                voceAnaliticaId
            },
        });
        res.json(updatedAllocation);
    } catch (error) {
        console.error(`Errore durante l'aggiornamento dell'allocazione ${id}:`, error);
        res.status(500).json({ error: "Impossibile aggiornare l'allocazione." });
    }
});

/**
 * DELETE /api/staging/allocations/:id
 * Elimina un'allocazione di staging.
 */
router.delete('/allocations/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.stagingAllocazione.delete({
            where: { id },
        });
        res.status(204).send(); // No Content
    } catch (error) {
        console.error(`Errore durante l'eliminazione dell'allocazione ${id}:`, error);
        res.status(500).json({ error: "Impossibile eliminare l'allocazione." });
    }
});

export default router; 