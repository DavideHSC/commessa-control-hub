import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/*
 * GET /api/reconciliation/staging-rows
 * Fornisce i dati per la Scrivania di Riconciliazione in modo robusto,
 * assemblando i dati manually per evitare problemi con il client Prisma.
 */
router.get('/staging-rows', async (req: Request, res: Response) => {
  try {
    console.log('[Recon] Richiesta ricevuta per /staging-rows');
    // 1. Recupera tutte le informazioni necessarie con query separate
    const righeContabili = await prisma.importScritturaRigaContabile.findMany({
      where: {
        OR: [
          { codiceConto: { startsWith: '6' } }, // Costi
          { codiceConto: { startsWith: '7' } }, // Ricavi
        ],
      },
    });
    console.log(`[Recon] Trovate ${righeContabili.length} righe contabili di costo/ricavo.`);
    if (righeContabili.length === 0) {
        console.log('[Recon] Nessuna riga contabile corrisponde ai filtri (conti che iniziano con 6 o 7). Restituisco array vuoto.');
        return res.json([]);
    }

    const testateMap = new Map();
    const testate = await prisma.importScritturaTestata.findMany();
    testate.forEach(t => testateMap.set(t.codiceUnivocoScaricamento, t));
    console.log(`[Recon] Trovate e mappate ${testate.length} testate.`);

    const allocazioni = await prisma.importAllocazione.findMany({
        include: { commessa: true }
    });
    console.log(`[Recon] Trovate ${allocazioni.length} allocazioni totali.`);
    
    // Raggruppa le allocazioni per riga contabile
    const allocazioniMap = new Map<string, any[]>();
    allocazioni.forEach(a => {
        if (!allocazioniMap.has(a.importScritturaRigaContabileId)) {
            allocazioniMap.set(a.importScritturaRigaContabileId, []);
        }
        allocazioniMap.get(a.importScritturaRigaContabileId)?.push(a);
    });

    // 2. Assembla e mappa i risultati
    let righeSenzaTestata = 0;
    const results = righeContabili
      .map((row) => {
        const testata = testateMap.get(row.codiceUnivocoScaricamento);
        const rowAllocations = allocazioniMap.get(row.id) || [];
        
        if (!testata) {
            righeSenzaTestata++;
            return null;
        }

        let status: 'Allocata' | 'Da Allocare' | 'Allocazione Parziale' = 'Da Allocare';
        const totaleAllocato = rowAllocations.reduce((acc, alloc) => acc + alloc.importo, 0);
        
        const importoDare = row.importoDare ?? 0;
        const importoAvere = row.importoAvere ?? 0;
        const importoRiga = importoDare > 0 ? importoDare : importoAvere;

        if (rowAllocations.length > 0) {
          if (Math.abs(totaleAllocato - importoRiga) < 0.01) {
            status = 'Allocata';
          } else if (totaleAllocato > 0) {
            status = 'Allocazione Parziale';
          }
        }

        return {
          id: row.id,
          dataRegistrazione: testata.dataRegistrazione,
          codiceConto: row.codiceConto,
          descrizione: row.descrizioneConto,
          importo: importoRiga,
          totaleAllocato,
          status,
          allocazioni: rowAllocations.map((a) => ({
            id: a.id,
            commessaNome: a.commessa.nome,
            commessaDescrizione: a.commessa.descrizione,
            importo: a.importo,
          })),
        };
      })
      .filter(r => r !== null); // Rimuovi le righe senza testata
    
    console.log(`[Recon] Righe elaborate: ${righeContabili.length}. Righe scartate per mancanza di testata: ${righeSenzaTestata}.`);
    console.log(`[Recon] Assemblaggio completato. Numero finale di risultati: ${results.length}.`);

    const sortedResults = results.sort((a, b) => new Date(a!.dataRegistrazione!).getTime() - new Date(b!.dataRegistrazione!).getTime());

    res.json(sortedResults);
  } catch (error) {
    console.error("Errore nel recupero delle righe di staging:", error);
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
        // Validation
        if (!rowId || !Array.isArray(newAllocations)) {
            return res.status(400).json({ error: "ID riga e un array di allocazioni sono richiesti." });
        }

        const row = await prisma.importScritturaRigaContabile.findUnique({ where: { id: rowId } });
        if (!row) {
            return res.status(404).json({ error: "Riga contabile non trovata." });
        }

        const importoRiga = (row.importoDare ?? 0) > 0 ? (row.importoDare ?? 0) : (row.importoAvere ?? 0);
        const totaleNuoveAllocazioni = newAllocations.reduce((acc, a) => acc + a.importo, 0);

        if (Math.abs(totaleNuoveAllocazioni - importoRiga) > 0.01) {
             // Non bloccante, ma potrebbe essere un avviso per il futuro
            console.warn(`Attenzione: il totale allocato (${totaleNuoveAllocazioni}) non corrisponde all'importo della riga (${importoRiga}) per la riga ${rowId}`);
        }

        // Transaction: delete old and create new
        const result = await prisma.$transaction(async (tx) => {
            // 1. Delete existing allocations for this row
            await tx.importAllocazione.deleteMany({
                where: { importScritturaRigaContabileId: rowId },
            });

            // 2. Create new allocations
            if (newAllocations.length > 0) {
                await tx.importAllocazione.createMany({
                    data: newAllocations.map(alloc => ({
                        importo: alloc.importo,
                        commessaId: alloc.commessaId,
                        importScritturaRigaContabileId: rowId,
                        suggerimentoAutomatico: false, // Queste sono manuali
                    })),
                });
            }
            
            // 3. Return the new state by fetching and assembling data manually
            const updatedRow = await tx.importScritturaRigaContabile.findUnique({
                where: { id: rowId },
            });
            const updatedAllocations = await tx.importAllocazione.findMany({
                where: { importScritturaRigaContabileId: rowId },
                include: { commessa: true }
            });

            return {
                ...updatedRow,
                allocazioni: updatedAllocations.map(a => ({
                    id: a.id,
                    commessaId: a.commessaId,
                    commessaNome: a.commessa.nome,
                    importo: a.importo
                }))
            };
        });

        res.status(200).json(result);

    } catch (error) {
        console.error(`Errore durante l'aggiornamento delle allocazioni per la riga ${rowId}:`, error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

export default router; 