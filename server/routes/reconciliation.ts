import { Router, Request, Response } from 'express';
import { PrismaClient, RigaScrittura, ScritturaContabile, Conto, Allocazione, Commessa } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Definiamo un tipo esplicito per il risultato della query per aiutare TypeScript
type RigaRiconciliazione = RigaScrittura & {
  scritturaContabile: ScritturaContabile;
  conto: Conto;
  allocazioni: (Allocazione & {
    commessa: Commessa;
  })[];
};

/*
 * GET /api/reconciliation/staging-rows
 * Fornisce i dati per la Scrivania di Riconciliazione in modo robusto,
 * assemblando i dati manually per evitare problemi con il client Prisma.
 */
router.get('/staging-rows', async (req: Request, res: Response) => {
  try {
    console.log('[Recon V2] Richiesta ricevuta per scritture contabili da allocare');

    const scritture = await prisma.scritturaContabile.findMany({
      where: {
        righe: {
          some: {
            conto: {
              tipo: {
                in: ['Costo', 'Ricavo']
              }
            }
          }
        }
      },
      include: {
        righe: {
          include: {
            conto: true,
            cliente: true,
            fornitore: true,
            allocazioni: {
              include: {
                commessa: true
              }
            }
          }
        }
      }
    });

    console.log(`[Recon V2] Trovate ${scritture.length} scritture con righe di costo/ricavo.`);

    if (scritture.length === 0) {
      return res.json([]);
    }

    const results = scritture.map(scrittura => {
      const righeCostoRicavo = scrittura.righe.filter(
        r => r.conto?.tipo === 'Costo' || r.conto?.tipo === 'Ricavo'
      );

      const importoTotale = righeCostoRicavo.reduce((acc, r) => acc + (r.dare > 0 ? r.dare : r.avere), 0);
      
      const totaleAllocato = righeCostoRicavo.flatMap(r => r.allocazioni).reduce((acc, a) => acc + a.importo, 0);

      let status: 'Allocata' | 'Da Allocare' | 'Allocazione Parziale' = 'Da Allocare';
      if (totaleAllocato > 0) {
        if (Math.abs(totaleAllocato - importoTotale) < 0.01) {
          status = 'Allocata';
        } else {
          status = 'Allocazione Parziale';
        }
      }

      // Trasforma le righe per il frontend
      const righeTrasformate = scrittura.righe.map(riga => {
        let soggetto: { codice: string | null; nome: string; tipoSoggetto: 'Conto' | 'Fornitore' | 'Cliente' } | null = null;
        if (riga.conto) {
          soggetto = { codice: riga.conto.codice, nome: riga.conto.nome, tipoSoggetto: 'Conto' };
        } else if (riga.fornitore) {
          soggetto = { codice: riga.fornitore.sottocontoFornitore, nome: riga.fornitore.nome, tipoSoggetto: 'Fornitore' };
        } else if (riga.cliente) {
          soggetto = { codice: riga.cliente.sottocontoCliente, nome: riga.cliente.nome, tipoSoggetto: 'Cliente' };
        }

        return {
          ...riga,
          soggetto: soggetto,
        };
      });

      return {
        ...scrittura,
        righe: righeTrasformate, // Usa le righe trasformate
        importo: importoTotale,
        totaleAllocato,
        status,
      };
    });

    res.json(results);

  } catch (error) {
    console.error("Errore nel recupero delle scritture da riconciliare:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

/*
 * POST /api/reconciliation/allocations/:rowId
 * Crea, aggiorna o elimina le allocazioni per una specifica riga contabile.
 * L'endpoint riceve un array di allocazioni. Sincronizza lo stato sul DB
 * eliminando le vecchie allocazioni e creando quelle nuove.
 */
router.post('/allocations/:rowId', async (req: Request, res: Response) => {
    const { rowId } = req.params;
    const newAllocations: { commessaId: string, importo: number }[] = req.body;

    try {
        if (!rowId || !Array.isArray(newAllocations)) {
            return res.status(400).json({ error: "ID riga e un array di allocazioni sono richiesti." });
        }

        const result = await prisma.$transaction(async (tx) => {
            const riga = await tx.rigaScrittura.findUnique({
                where: { id: rowId },
                include: { conto: true }
            });

            if (!riga) {
                // Throwing an error within a transaction automatically triggers a rollback.
                throw new Error("Riga contabile non trovata.");
            }
            
            // Critical check: An allocation requires an analytical item (VoceAnalitica).
            // We infer this from the Conto associated with the RigaScrittura.
            if (!riga.conto) {
                throw new Error(`La riga ${riga.id} non è collegata a un Conto di mastro e non può essere allocata.`);
            }
            const voceAnaliticaId = riga.conto.voceAnaliticaId;
            if (!voceAnaliticaId && newAllocations.length > 0 && newAllocations.some(a => a.importo > 0)) {
                // If the account isn't set up for analytical accounting, we cannot proceed.
                throw new Error(`Il conto ${riga.conto.codice} - ${riga.conto.nome} non ha una voce analitica associata. Impossibile salvare le allocazioni.`);
            }

            // 1. Delete existing allocations for this row
            await tx.allocazione.deleteMany({
                where: { rigaScritturaId: rowId },
            });

            // 2. Create new allocations if they are provided and have an amount > 0
            if (newAllocations.length > 0 && voceAnaliticaId) {
                const validAllocations = newAllocations.filter(a => a.commessaId && a.importo > 0);
                if (validAllocations.length > 0) {
                    await tx.allocazione.createMany({
                        data: validAllocations.map(alloc => ({
                            importo: alloc.importo,
                            commessaId: alloc.commessaId,
                            rigaScritturaId: rowId,
                            voceAnaliticaId: voceAnaliticaId, // Use the inferred ID
                        })),
                    });
                }
            }
            
            // 3. Return the new state by fetching the updated row with its new allocations
            const updatedRiga = await tx.rigaScrittura.findUnique({
                where: { id: rowId },
                include: { 
                    allocazioni: {
                        include: {
                            commessa: true
                        }
                    } 
                }
            });

            // Format the response to match what the frontend expects
            return {
                ...updatedRiga,
                allocazioni: updatedRiga?.allocazioni.map(a => ({
                    id: a.id,
                    commessaId: a.commessaId,
                    commessaNome: a.commessa.nome,
                    importo: a.importo
                })) || []
            };
        });

        res.status(200).json(result);

    } catch (error: unknown) {
        console.error(`Errore durante l'aggiornamento delle allocazioni per la riga ${rowId}:`, error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Errore interno del server" });
        }
    }
});

export default router; 