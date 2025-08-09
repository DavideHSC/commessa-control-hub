import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Inizio seeding del template per CONTIAZI (con posizioni corrette)...');

  const templateName = 'piano_dei_conti_aziendale';

  // Dati del template e dei campi BASATI SUL TRACCIATO UFFICIALE CONTIAZI.TXT
  const fieldDefinitions = [
    { fieldName: 'filler_1', start: 1, length: 3, end: 3, format: null },
    { fieldName: 'codiceFiscaleAzienda', start: 4, length: 16, end: 19, format: 'string' },
    { fieldName: 'subcodiceAzienda', start: 20, length: 1, end: 20, format: 'string' },
    { fieldName: 'tabellaItalstudio', start: 21, length: 1, end: 21, format: 'string' },
    { fieldName: 'livello', start: 22, length: 1, end: 22, format: 'string' },
    { fieldName: 'codice', start: 23, length: 10, end: 32, format: 'string' },
    { fieldName: 'tipo', start: 33, length: 1, end: 33, format: 'string' },
    { fieldName: 'descrizione', start: 34, length: 60, end: 93, format: 'string' },
    { fieldName: 'sigla', start: 94, length: 12, end: 105, format: 'string' },
    { fieldName: 'controlloSegno', start: 106, length: 1, end: 106, format: 'string' },
    { fieldName: 'contoCostiRicavi', start: 107, length: 10, end: 116, format: 'string' },
    { fieldName: 'validoImpresaOrdinaria', start: 117, length: 1, end: 117, format: 'boolean_X' },
    { fieldName: 'validoImpresaSemplificata', start: 118, length: 1, end: 118, format: 'boolean_X' },
    { fieldName: 'validoProfessionistaOrdinario', start: 119, length: 1, end: 119, format: 'boolean_X' },
    { fieldName: 'validoProfessionistaSemplificato', start: 120, length: 1, end: 120, format: 'boolean_X' },
    { fieldName: 'validoUnicoPf', start: 121, length: 1, end: 121, format: 'boolean_X' },
    { fieldName: 'validoUnicoSp', start: 122, length: 1, end: 122, format: 'boolean_X' },
    { fieldName: 'validoUnicoSc', start: 123, length: 1, end: 123, format: 'boolean_X' },
    { fieldName: 'validoUnicoEnc', start: 124, length: 1, end: 124, format: 'boolean_X' },
    { fieldName: 'classeIrpefIres', start: 125, length: 10, end: 134, format: 'string' },
    { fieldName: 'classeIrap', start: 135, length: 10, end: 144, format: 'string' },
    { fieldName: 'classeProfessionista', start: 145, length: 10, end: 154, format: 'string' },
    { fieldName: 'classeIrapProfessionista', start: 155, length: 10, end: 164, format: 'string' },
    { fieldName: 'classeIva', start: 165, length: 10, end: 174, format: 'string' },
    { fieldName: 'classeDatiStudiSettore', start: 175, length: 10, end: 184, format: 'string' },
    { fieldName: 'colonnaRegistroCronologico', start: 185, length: 4, end: 188, format: 'number' },
    { fieldName: 'colonnaRegistroIncassiPagamenti', start: 189, length: 4, end: 192, format: 'number' },
    { fieldName: 'contoDareCee', start: 193, length: 12, end: 204, format: 'string' },
    { fieldName: 'contoAvereCee', start: 205, length: 12, end: 216, format: 'string' },
    { fieldName: 'naturaConto', start: 217, length: 4, end: 220, format: 'string' },
    { fieldName: 'gestioneBeniAmmortizzabili', start: 221, length: 1, end: 221, format: 'string' },
    { fieldName: 'percDeduzioneManutenzione', start: 222, length: 6, end: 227, format: 'percentage_999.99' },
    { fieldName: 'gruppo', start: 228, length: 1, end: 228, format: 'string' },
    { fieldName: 'dettaglioClienteFornitore', start: 229, length: 1, end: 229, format: 'string' },
    { fieldName: 'descrizioneBilancioDare', start: 230, length: 60, end: 289, format: 'string' },
    { fieldName: 'descrizioneBilancioAvere', start: 290, length: 60, end: 349, format: 'string' },
    { fieldName: 'utilizzaDescrizioneLocale', start: 350, length: 1, end: 350, format: 'boolean_X' },
    { fieldName: 'descrizioneLocale', start: 351, length: 40, end: 390, format: 'string' },
    { fieldName: 'consideraBilancioSemplificato', start: 391, length: 1, end: 391, format: 'boolean_X' },
  ];

  // Trova il template esistente
  const template = await prisma.importTemplate.findUnique({
    where: { name: templateName },
    include: { fieldDefinitions: true },
  });

  if (template) {
    // Se esiste, elimina i vecchi campi e inserisce quelli corretti
    await prisma.fieldDefinition.deleteMany({
      where: { templateId: template.id },
    });
    await prisma.importTemplate.update({
      where: { name: templateName },
      data: {
        fieldDefinitions: {
          create: fieldDefinitions,
        },
      },
    });
    console.log(`✅ Template '${templateName}' aggiornato con le definizioni corrette.`);
  } else {
    // Altrimenti, crea il template da zero
    await prisma.importTemplate.create({
      data: {
        id: 'clz_contiazi_template',
        name: templateName,
        modelName: 'Conto',
        fileIdentifier: 'CODICE FISCALE AZIENDA',
        fieldDefinitions: {
          create: fieldDefinitions,
        },
      }
    });
    console.log(`✅ Template '${templateName}' creato con le definizioni corrette.`);
  }
}

main()
  .catch((e) => {
    console.error('Errore durante il seeding del template CONTIAZI:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 