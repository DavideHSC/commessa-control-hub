import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import iconv from 'iconv-lite';

// --- CONFIGURAZIONE ---
const TEMPLATE_NAME = 'anagrafica_clifor';
const RECORDS_TO_DEBUG = ['CARM', 'ESPM', 'TELECOM'];

// --- SCRIPT DI DEBUG AUTO-CONTENUTO ---

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '..', '.docs', 'dati_cliente', 'A_CLIFOR.TXT');

/**
 * Funzione di parsing che non dipende da import esterni.
 * La logica è estratta e adattata da 'fixedWidthParser.ts'.
 */
function parseLine(line, definitions) {
  const record = {};
  for (const def of definitions) {
    if (def.fieldName) {
      // Estrae il valore usando start (1-based) e end (1-based)
      const value = line.substring(def.start - 1, def.end).trim();
      
      // Converte il tipo di dato in base al formato specificato nel DB
      switch (def.format) {
        case 'number':
          record[def.fieldName] = value ? parseFloat(value.replace(',', '.')) : null;
          break;
        case 'percentage':
          // Converte stringhe come "002200" in 22.00
          record[def.fieldName] = value ? parseFloat(value) / 100 : null;
          break;
        case 'date:DDMMYYYY':
          // Semplice parsing di data, puoi usare moment o date-fns se serve robustezza
          if (value && value.match(/^\d{8}$/)) {
            const d = value.substring(0, 2);
            const m = value.substring(2, 4);
            const y = value.substring(4, 8);
            record[def.fieldName] = new Date(`${y}-${m}-${d}`);
          } else {
            record[def.fieldName] = null;
          }
          break;
        case 'boolean':
            // Assume che 'X' o 'S' (Sì) o '1' indichino true
            record[def.fieldName] = ['X', 'S', '1'].includes(value.toUpperCase());
            break;
        case 'string':
        default:
          record[def.fieldName] = value;
          break;
      }
    }
  }
  return record;
}


async function runDebug() {
  console.log(`--- SCRIPT DI DEBUG ANAGRAFICA (AUTO-CONTENUTO) ---`);
  
  try {
    // 1. Recupero definizioni dal DB
    console.log(`\n1. Caricamento definizioni per '${TEMPLATE_NAME}'...`);
    const fieldDefinitions = await prisma.fieldDefinition.findMany({
      where: { template: { name: TEMPLATE_NAME } },
      orderBy: { start: 'asc' },
    });

    if (!fieldDefinitions || fieldDefinitions.length === 0) {
      throw new Error(`Nessuna definizione trovata per il template '${TEMPLATE_NAME}'.`);
    }
    console.log(`Trovate ${fieldDefinitions.length} definizioni. Eccone alcune:`);
    console.table(fieldDefinitions.slice(0, 5).map(d => ({ fieldName: d.fieldName, start: d.start, end: d.end, length: d.length, format: d.format })));
    console.table(fieldDefinitions.slice(5, 10).map(d => ({ fieldName: d.fieldName, start: d.start, end: d.end, length: d.length, format: d.format })));


    // 2. Lettura file
    console.log(`\n2. Lettura file: ${FILE_PATH}`);
    const buffer = await fs.readFile(FILE_PATH);
    const fileContent = iconv.decode(buffer, 'latin1');
    const lines = fileContent.split(/\r?\n/);
    console.log(`Lette ${lines.length} righe.`);

    // 3. Analisi dei record specifici
    console.log(`\n3. Analisi record specifici: ${RECORDS_TO_DEBUG.join(', ')}`);
    for (const recordId of RECORDS_TO_DEBUG) {
      console.log(`\n--- Analisi per ID: ${recordId} ---`);
      const recordLine = lines.find(line => line.includes(recordId));

      if (!recordLine) {
        console.warn(`Riga per '${recordId}' non trovata.`);
        continue;
      }
      
      console.log(`Riga trovata: "${recordLine.substring(0, 100)}..."`);
      
      const parsedRecord = parseLine(recordLine, fieldDefinitions);

      console.log(`Risultato del parsing per '${recordId}':`);
      console.log(JSON.stringify(parsedRecord, null, 2));
    }

  } catch (error) {
    console.error('\n\n❌ ERRORE CRITICO:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n--- DEBUG COMPLETATO ---');
  }
}

runDebug(); 