import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Layout basato ESCLUSIVAMENTE su .docs/code/parser.py
// Le posizioni sono state convertite in start (1-based) e length
const LAYOUT_PNRIGIVA_FROM_PYTHON = [
    { name: 'codiceUnivocoScaricamento', start: 4, length: 12, type: 'string' }, // (3, 15)
    { name: 'codiceIva', start: 16, length: 4, type: 'string' },                  // (15, 19)
    { name: 'contropartita', start: 20, length: 10, type: 'string' },             // (19, 29)
    { name: 'imponibile', start: 30, length: 12, type: 'number' },                // (29, 41)
    { name: 'imposta', start: 42, length: 12, type: 'number' },                   // (41, 53)
    { name: 'impostaIntrattenimenti', start: 54, length: 12, type: 'number' },    // (53, 65)
    { name: 'imponibile50Perc', start: 66, length: 12, type: 'number' },          // (65, 77) - Corretto da 'IMPONIBILE_50_PERC'
    { name: 'impostaNonConsiderata', start: 78, length: 12, type: 'number' },    // (77, 89)
    { name: 'importoLordo', start: 90, length: 12, type: 'number' },              // (89, 101)
    { name: 'note', start: 102, length: 60, type: 'string' },                     // (101, 161)
    { name: 'siglaContropartita', start: 162, length: 12, type: 'string' },       // (161, 173)
];

async function main() {
    console.log("Inizio creazione layout per 'PNRIGIVA.TXT' basato su parser.py...");

    const template = await prisma.importTemplate.findUnique({
        where: { name: 'scritture_contabili' },
    });

    if (!template) {
        console.error("Template 'scritture_contabili' non trovato. Impossibile procedere.");
        return;
    }
    
    console.log(`Trovato template: '${template.name}' (ID: ${template.id})`);

    for (const field of LAYOUT_PNRIGIVA_FROM_PYTHON) {
        const fieldData = {
            templateId: template.id,
            fileIdentifier: 'PNRIGIVA.TXT',
            fieldName: field.name,
            start: field.start,
            length: field.length,
            format: field.type,
        };

        const existingField = await prisma.fieldDefinition.findFirst({
            where: {
                templateId: template.id,
                fileIdentifier: 'PNRIGIVA.TXT',
                fieldName: field.name,
            },
        });

        if (existingField) {
            await prisma.fieldDefinition.update({
                where: { id: existingField.id },
                data: fieldData,
            });
            console.log(`-> Campo '${field.name}' (PNRIGIVA.TXT) AGGIORNATO.`);
        } else {
            await prisma.fieldDefinition.create({
                data: fieldData,
            });
            console.log(`-> Campo '${field.name}' (PNRIGIVA.TXT) CREATO.`);
        }
    }

    console.log("\nCreazione layout per 'PNRIGIVA.TXT' completata.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 