import { PrismaClient, TipoConto } from '@prisma/client';
const prisma = new PrismaClient();
// Mappatura basata sul documento .docs/analysis/voci-costo-analitico.md
const MAPPING = {
    '6005000150': 'Materiale di Consumo',
    '6005000850': 'Carburanti e Lubrificanti',
    '6015000400': 'Utenze',
    '6015000751': 'Lavorazioni Esterne',
    '6015000800': 'Spese Generali / di Struttura',
    '6015002101': 'Pulizie di Cantiere',
    '6015002102': 'Pulizie di Cantiere',
    '6015002700': 'Utenze',
    '6015003710': 'Oneri e Spese Accessorie',
    '6015007703': 'Smaltimento Rifiuti Speciali',
    '6015009701': 'Manutenzione Mezzi',
    '6016000310': 'Consulenze Tecniche/Legali',
    '6018000940': 'Servizi Generici di Cantiere',
    '6020001290': 'Canoni Leasing Mezzi/Attrezz.',
    '6020001420': 'Canoni Leasing Mezzi/Attrezz.',
    '6310000500': 'Manodopera Diretta',
    '6320000350': 'Oneri su Manodopera',
};
const NOMI_CONTI_NON_ANALITICI = [
    'Oneri Finanziari',
    'Imposte e Tasse Deducibili',
];
async function main() {
    console.log('Inizio script di mapping dei conti alle voci analitiche...');
    try {
        // 1. Carica tutte le Voci Analitiche per avere un mapping Nome -> ID
        const vociAnalitiche = await prisma.voceAnalitica.findMany();
        const vociMap = new Map(vociAnalitiche.map(v => [v.nome, v.id]));
        const defaultVoceId = vociMap.get('Costi/Ricavi da Classificare');
        if (!defaultVoceId) {
            throw new Error('La voce analitica di default "Costi/Ricavi da Classificare" non è stata trovata. Eseguire il seed del database.');
        }
        // 2. Carica tutti i Conti
        const conti = await prisma.conto.findMany();
        console.log(`Trovati ${conti.length} conti nel database.`);
        let contiAggiornati = 0;
        let contiNonModificati = 0;
        let contiNonTrovatiInMapping = 0;
        const updates = [];
        // 3. Itera sui conti e applica il mapping
        for (const conto of conti) {
            // Ignora i conti che non sono di costo o ricavo, a meno che non siano stati forzati nel mapping
            const isCostoORicavo = conto.tipo === TipoConto.Costo || conto.tipo === TipoConto.Ricavo;
            const isInMapping = conto.codice && MAPPING[conto.codice];
            if (!isCostoORicavo && !isInMapping) {
                contiNonModificati++;
                continue;
            }
            // Salta i conti che hanno nomi specifici da non allocare
            if (conto.nome && NOMI_CONTI_NON_ANALITICI.includes(conto.nome)) {
                contiNonModificati++;
                continue;
            }
            let voceAnaliticaIdDaCollegare = undefined;
            if (conto.codice && isInMapping) {
                const nomeVoce = MAPPING[conto.codice];
                voceAnaliticaIdDaCollegare = vociMap.get(nomeVoce);
                if (!voceAnaliticaIdDaCollegare) {
                    console.warn(`ATTENZIONE: La voce analitica "${nomeVoce}" specificata per il conto ${conto.codice} non esiste nel database.`);
                }
            }
            else {
                // Se è un costo/ricavo ma non è nel mapping, usa la voce di default
                voceAnaliticaIdDaCollegare = defaultVoceId;
                contiNonTrovatiInMapping++;
            }
            // Se abbiamo trovato una voce da collegare e il conto non è già collegato a quella voce
            if (voceAnaliticaIdDaCollegare && conto.voceAnaliticaId !== voceAnaliticaIdDaCollegare) {
                updates.push(prisma.conto.update({
                    where: { id: conto.id },
                    data: { voceAnaliticaId: voceAnaliticaIdDaCollegare },
                }));
                contiAggiornati++;
            }
            else {
                contiNonModificati++;
            }
        }
        console.log(`\nPreparati ${updates.length} aggiornamenti. Esecuzione in corso...`);
        await prisma.$transaction(updates);
        console.log('\n--- Risultato del Mapping ---');
        console.log(`✅ Conti aggiornati con una nuova voce analitica: ${contiAggiornati}`);
        console.log(`🔵 Conti già correttamente mappati o non economici: ${contiNonModificati}`);
        console.log(`🟠 Conti di costo/ricavo non trovati nel mapping e assegnati alla voce di default: ${contiNonTrovatiInMapping}`);
        console.log('-----------------------------\n');
    }
    catch (error) {
        console.error('Si è verificato un errore durante lo script di mapping:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
