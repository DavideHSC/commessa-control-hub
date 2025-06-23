import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mappatura tra nomi campo Python e nomi campo DB (modelli Cliente/Fornitore)
const fieldNameMapping: Record<string, string> = {
    'CODICE_FISCALE_CLIFOR': 'codiceFiscale',
    'PARTITA_IVA': 'partitaIva',
    'TIPO_CONTO': 'tipo',
    'SOTTOCONTO_CLIENTE': 'externalId', // Usiamo questo come ID esterno
    'SOTTOCONTO_FORNITORE': 'externalId', // Anche per il fornitore
    'DENOMINAZIONE': 'denominazione',
    'COGNOME': 'cognome',
    'NOME': 'nome',
    'INDIRIZZO': 'indirizzo',
    'CAP': 'cap',
    'COMUNE_RESIDENZA': 'comune'
};

// Layout corretto per A_CLIFOR.TXT, basato sul parser Python
const anagraficaLayoutCorretto = [
    { pythonName: 'CODICE_FISCALE_CLIFOR', start: 33,  length: 16, format: 'string' },
    { pythonName: 'PARTITA_IVA',           start: 83,  length: 11, format: 'string' },
    { pythonName: 'TIPO_CONTO',            start: 50,  length: 1,  format: 'string' }, // 'C', 'F', 'E'
    { pythonName: 'SOTTOCONTO_CLIENTE',    start: 51,  length: 10, format: 'string' },
    { pythonName: 'SOTTOCONTO_FORNITORE',  start: 61,  length: 10, format: 'string' },
    { pythonName: 'DENOMINAZIONE',         start: 95,  length: 60, format: 'string' },
    { pythonName: 'COGNOME',               start: 155, length: 20, format: 'string' },
    { pythonName: 'NOME',                  start: 175, length: 20, format: 'string' },
    { pythonName: 'INDIRIZZO',             start: 217, length: 30, format: 'string' },
    { pythonName: 'CAP',                   start: 212, length: 5,  format: 'string' },
    { pythonName: 'COMUNE_RESIDENZA',      start: 208, length: 4,  format: 'string' },
];

async function updateLayouts() {
    console.log("Inizio creazione layout per 'anagrafica_clifor'...");

    const template = await prisma.importTemplate.findUnique({
        where: { name: 'anagrafica_clifor' },
    });

    if (!template) {
        console.error("Template 'anagrafica_clifor' non trovato.");
        return;
    }
    
    console.log(`Trovato template: ${template.name} (ID: ${template.id})`);

    for (const correctField of anagraficaLayoutCorretto) {
        const fieldName = fieldNameMapping[correctField.pythonName];
        if (!fieldName) {
            console.warn(`!! Attenzione: Nessun mapping per il campo Python '${correctField.pythonName}'. Ignorato.`);
            continue;
        }

        const existingField = await prisma.fieldDefinition.findFirst({
            where: {
                templateId: template.id,
                fileIdentifier: 'A_CLIFOR.TXT',
                fieldName: fieldName,
            }
        });

        const data = {
            start: correctField.start,
            length: correctField.length,
            format: correctField.format,
            templateId: template.id,
            fileIdentifier: 'A_CLIFOR.TXT',
            fieldName: fieldName,
        };

        if (existingField) {
            await prisma.fieldDefinition.update({
                where: { id: existingField.id },
                data: { start: data.start, length: data.length, format: data.format }
            });
            console.log(`-> Campo '${fieldName}' (A_CLIFOR.TXT) aggiornato.`);
        } else {
            await prisma.fieldDefinition.create({ data });
            console.log(`-> Campo '${fieldName}' (A_CLIFOR.TXT) CREATO.`);
        }
    }

    console.log("\nCreazione layout per 'anagrafica_clifor' completata.");
}

updateLayouts()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 