const { PrismaClient } = require('@prisma/client');
// Poiché questo è un file .cjs, possiamo usare require per importare un modulo che probabilmente è CommonJS
const { parseFixedWidthRobust } = require('./lib/fixedWidthParser.js');
const path = require('path');
const fs = require('fs/promises');
const iconv = require('iconv-lite');

const prisma = new PrismaClient();

const TEMPLATE_NAME = 'anagrafica_clifor';
// __dirname è disponibile nativamente nei moduli CommonJS (.cjs)
const FILE_PATH = path.join(__dirname, '..', '.docs', 'dati_cliente', 'A_CLIFOR.TXT');
const RECORDS_TO_DEBUG = ['CARM', 'ESPM', 'TELECOM'];

async function debugAnagraficaParser() {
  console.log(`--- SCRIPT DI DEBUG PER PARSER ANAGRAFICA (CJS) ---`);
  
  // 1. Recupero e stampo le definizioni dei campi dal DB
  console.log(`\n1. Recupero le definizioni per il template '${TEMPLATE_NAME}'...`);
  const fieldDefinitions = await prisma.fieldDefinition.findMany({
    where: {
      template: {
        name: TEMPLATE_NAME,
      },
    },
    orderBy: {
      start: 'asc',
    },
  });
  
  if (!fieldDefinitions || fieldDefinitions.length === 0) {
    console.error(`\nERRORE: Nessuna definizione trovata per il template '${TEMPLATE_NAME}'. Controlla il nome e il database.`);
    await prisma.$disconnect();
    return;
  }
  
  console.log(`Trovate ${fieldDefinitions.length} definizioni:`);
  console.table(fieldDefinitions.map(def => ({
    fieldName: def.fieldName,
    start: def.start,
    end: def.end,
    length: def.length,
    format: def.format,
  })));

  // 2. Leggo il file di anagrafica
  console.log(`\n2. Lettura del file di anagrafica da: ${FILE_PATH}`);
  let fileContent;
  try {
    const buffer = await fs.readFile(FILE_PATH);
    fileContent = iconv.decode(buffer, 'latin1');
  } catch (error) {
    console.error(`\nERRORE: Impossibile leggere il file ${FILE_PATH}.`, error);
    await prisma.$disconnect();
    return;
  }

  const lines = fileContent.split(/\r?\n/);
  console.log(`Trovate ${lines.length} righe nel file.`);

  // 3. Eseguo il parsing per i record specifici
  console.log(`\n3. Avvio il parsing per i record: ${RECORDS_TO_DEBUG.join(', ')}`);

  for (const recordId of RECORDS_TO_DEBUG) {
    console.log(`\n--- Analisi Record: ${recordId} ---`);
    
    const recordLine = lines.find(line => line.includes(recordId));

    if (!recordLine) {
      console.warn(`ATTENZIONE: Riga per '${recordId}' non trovata nel file.`);
      continue;
    }

    console.log(`Riga trovata: "${recordLine}"`);

    const tempFileName = `debug_anagrafica_${recordId}_${Date.now()}.txt`;
    const tempFilePath = path.join(process.cwd(), 'uploads', tempFileName);
    
    try {
      await fs.writeFile(tempFilePath, recordLine, 'latin1');
      const parseResult = await parseFixedWidthRobust(tempFilePath, [], TEMPLATE_NAME);
      
      console.log(`\nRisultato del parsing per '${recordId}':`);
      if (parseResult.data.length > 0) {
        console.log(JSON.stringify(parseResult.data[0], null, 2));
      } else {
        console.error(`ERRORE: Il parsing non ha prodotto risultati.`);
        if (parseResult.stats.errors.length > 0) {
          console.error('Errori registrati:', parseResult.stats.errors);
        }
      }
    } catch (error) {
      console.error(`\nERRORE durante l'esecuzione del parsing per '${recordId}':`, error);
    } finally {
      await fs.unlink(tempFilePath).catch(err => console.warn(`Impossibile eliminare file temporaneo ${tempFilePath}: ${err.message}`));
    }
  }

  await prisma.$disconnect();
  console.log('\n--- DEBUG COMPLETATO ---');
}

debugAnagraficaParser().catch(e => {
  console.error('\nERRORE CRITICO NELLO SCRIPT DI DEBUG:', e);
  prisma.$disconnect();
  process.exit(1);
}); 