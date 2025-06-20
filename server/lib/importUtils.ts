import { Prisma, PrismaClient, TipoConto } from '@prisma/client';

const prisma = new PrismaClient();
const SYSTEM_CUSTOMER_ID = 'system_customer_01'; // Assicurati che questo ID sia nel seed
const SYSTEM_SUPPLIER_ID = 'system_supplier_01';

export async function processScrittureInBatches(data: { testate: any[], righeContabili: any[], righeIva: any[], allocazioni: any[] }) {
    const { testate, righeContabili, righeIva, allocazioni } = data;
    
    // Mappe dati pre-elaborate per efficienza
    const testateMap = new Map(testate.map(t => [t.externalId.trim(), t]));
    const righeContabiliMap = new Map<string, any[]>();
    righeContabili.forEach(r => {
        const testataId = r.externalId.substring(0, 12).trim();
        if (!righeContabiliMap.has(testataId)) righeContabiliMap.set(testataId, []);
        righeContabiliMap.get(testataId)!.push(r);
    });
    const righeIvaMap = new Map<string, any[]>();
    righeIva.forEach(r => {
        const rigaId = r.externalId.trim();
        if (!righeIvaMap.has(rigaId)) righeIvaMap.set(rigaId, []);
        righeIvaMap.get(rigaId)!.push(r);
    });
    const allocazioniMap = new Map<string, any[]>();
    allocazioni.forEach(a => {
        const rigaId = a.externalId.trim();
        if (!allocazioniMap.has(rigaId)) allocazioniMap.set(rigaId, []);
        allocazioniMap.get(rigaId)!.push(a);
    });

    let processedCount = 0;
    let errorCount = 0;
    const totalBatches = testateMap.size;
    console.log(`[Import] Inizio elaborazione di ${totalBatches} scritture in batch...`);

    for (const [testataId, testata] of testateMap.entries()) {
        try {
            // Ogni testata viene processata in una transazione separata
            await prisma.$transaction(async (tx) => {
                const fornitoreId = testata.clienteFornitoreCodiceFiscale?.trim();
                if (fornitoreId) {
                    await tx.fornitore.upsert({
                        where: { id: fornitoreId },
                        update: {},
                        create: {
                            id: fornitoreId,
                            externalId: fornitoreId,
                            nome: `Fornitore importato - ${fornitoreId}`
                        }
                    });
                }

                const scritturaData = {
                    data: testata.dataRegistrazione,
                    descrizione: `Importazione - ${testataId}`,
                    causaleId: testata.causaleId.trim(),
                    dataDocumento: testata.dataDocumento,
                    numeroDocumento: testata.numeroDocumento.trim(),
                    fornitoreId: fornitoreId || undefined
                };

                const scrittura = await tx.scritturaContabile.upsert({
                    where: { externalId: testataId },
                    update: scritturaData,
                    create: { ...scritturaData, externalId: testataId }
                });

                const righeContabiliPerTestata = righeContabiliMap.get(testataId) || [];
                for (const riga of righeContabiliPerTestata) {
                    const rigaId = riga.externalId.trim();
                    const contoId = riga.conto.trim();
                    if (!contoId) continue;

                    await tx.conto.upsert({
                        where: { id: contoId },
                        update: {},
                        create: {
                            id: contoId,
                            codice: contoId,
                            nome: `Conto importato - ${contoId}`,
                            tipo: TipoConto.Patrimoniale,
                            richiedeVoceAnalitica: false,
                        }
                    });

                    const rigaScrittura = await tx.rigaScrittura.create({
                        data: {
                            scritturaContabileId: scrittura.id,
                            descrizione: riga.note.trim(),
                            dare: riga.importoDare,
                            avere: riga.importoAvere,
                            contoId: contoId,
                        }
                    });

                    const righeIvaPerRiga = righeIvaMap.get(rigaId) || [];
                    for (const rigaIva of righeIvaPerRiga) {
                        const codiceIvaId = rigaIva.codiceIva.trim();
                        if (!codiceIvaId) continue;
                        await tx.codiceIva.upsert({
                            where: { id: codiceIvaId },
                            update: {},
                            create: {
                                id: codiceIvaId,
                                descrizione: `IVA importata - ${codiceIvaId}`,
                                aliquota: 0,
                            }
                        });
                        await tx.rigaIva.create({
                            data: {
                                rigaScritturaId: rigaScrittura.id,
                                imponibile: rigaIva.imponibile,
                                imposta: rigaIva.imposta,
                                codiceIvaId: codiceIvaId,
                            }
                        });
                    }

                    const allocazioniPerRiga = allocazioniMap.get(rigaId) || [];
                    for (const alloc of allocazioniPerRiga) {
                        const commessaId = alloc.centroDiCosto.trim();
                        const voceAnaliticaId = alloc.parametro.toString().trim();
                        if (!commessaId || !voceAnaliticaId) continue;

                        await tx.voceAnalitica.upsert({
                            where: { id: voceAnaliticaId },
                            update: {},
                            create: {
                                id: voceAnaliticaId,
                                nome: `Voce importata - ${voceAnaliticaId}`
                            }
                        });

                        await tx.commessa.upsert({
                            where: { id: commessaId },
                            update: {},
                            create: {
                                id: commessaId,
                                nome: `Commessa importata - ${commessaId}`,
                                clienteId: SYSTEM_CUSTOMER_ID
                            }
                        });

                        await tx.allocazione.create({
                            data: {
                                rigaScritturaId: rigaScrittura.id,
                                importo: alloc.parametro,
                                commessaId: commessaId,
                                voceAnaliticaId: voceAnaliticaId, 
                            }
                        });
                    }
                }
            });
            processedCount++;
            if (processedCount % 100 === 0) {
                console.log(`[Import] Progresso: ${processedCount} / ${totalBatches} scritture elaborate...`);
            }
        } catch (error) {
            console.error(`[Import] Errore durante l'elaborazione della testata ${testataId}. Questo record sarà saltato. Dettagli:`, error);
            errorCount++;
        }
    }

    console.log(`[Import] Elaborazione batch completata. Successo: ${processedCount}, Errori: ${errorCount}.`);
    return { processedCount, errorCount };
} 