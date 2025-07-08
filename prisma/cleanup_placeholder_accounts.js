import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Avvio dello script di pulizia dei conti segnaposto...');
    // Identifica i conti che sono chiaramente segnaposto per clienti/fornitori
    const placeholderConti = await prisma.conto.findMany({
        where: {
            OR: [
                { nome: { startsWith: 'Conto importato -' } },
                { nome: { startsWith: 'Fornitore importato -' } },
                { nome: { startsWith: 'Cliente importato -' } },
                // Aggiungiamo una condizione sui codici che tipicamente non sono conti di mastro
                { codice: { startsWith: '2010' } }, // Prefisso fornitori
                { codice: { startsWith: '1010' } }, // Prefisso clienti
            ],
            // Assicuriamoci di non cancellare conti che hanno già allocazioni, per sicurezza
            righeScrittura: {
                every: {
                    allocazioni: {
                        none: {},
                    },
                },
            },
        },
        select: {
            id: true,
            codice: true,
            nome: true,
            _count: {
                select: { righeScrittura: true },
            },
        },
    });
    if (placeholderConti.length === 0) {
        console.log('Nessun conto segnaposto da pulire. Il database è già pulito.');
        return;
    }
    console.log(`Trovati ${placeholderConti.length} conti segnaposto da analizzare.`);
    const contiDaCancellareIds = [];
    for (const conto of placeholderConti) {
        // Logica di sicurezza: non cancellare conti se hanno molte scritture associate
        // Potrebbe essere un falso positivo.
        if (conto._count.righeScrittura > 50) { // Soglia di sicurezza
            console.warn(`⚠️  Conto ${conto.codice} - "${conto.nome}" ha ${conto._count.righeScrittura} righe associate. Sarà saltato per sicurezza.`);
            continue;
        }
        contiDaCancellareIds.push(conto.id);
    }
    if (contiDaCancellareIds.length === 0) {
        console.log('Nessun conto corrisponde ai criteri di cancellazione sicura.');
        return;
    }
    console.log(`Trovati ${contiDaCancellareIds.length} conti segnaposto da CANCELLARE.`);
    try {
        // Non possiamo cancellare direttamente i conti se hanno righe di scrittura associate.
        // Dobbiamo prima "scollegare" le righe.
        // Con la nuova logica, le righe dovrebbero essere associate a un cliente/fornitore,
        // quindi aggiornare il loro `contoId` a `null` dovrebbe essere sicuro.
        console.log('Aggiornamento delle righe di scrittura per rimuovere i collegamenti ai conti segnaposto...');
        const updatedRows = await prisma.rigaScrittura.updateMany({
            where: {
                contoId: {
                    in: contiDaCancellareIds,
                },
            },
            data: {
                contoId: null,
            },
        });
        console.log(`Scollegati ${updatedRows.count} righe di scrittura.`);
        // Ora possiamo cancellare i conti
        console.log('Cancellazione dei conti segnaposto...');
        const deletedConti = await prisma.conto.deleteMany({
            where: {
                id: {
                    in: contiDaCancellareIds,
                },
            },
        });
        console.log(`✅ Cancellati ${deletedConti.count} conti segnaposto con successo.`);
    }
    catch (error) {
        console.error('Errore durante la pulizia dei conti segnaposto:', error);
        throw error;
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
