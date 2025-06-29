import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import iconv from 'iconv-lite';

// --- CONFIGURAZIONE ---
const TEMPLATE_NAME = 'anagrafica_clifor';
const MAX_RECORDS_TO_TEST = 10;

// --- SCRIPT DI TEST AUTO-CONTENUTO ---

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '..', '.docs', 'dati_cliente', 'A_CLIFOR.TXT');

// --- LOGICA DI PARSING (da debug_parser.js) ---
function parseLine(line, definitions) {
  const record = {};
  for (const def of definitions) {
    if (def.fieldName) {
      const value = line.substring(def.start - 1, def.end).trim();
      record[def.fieldName] = value; // Per il test, manteniamo le stringhe grezze
    }
  }
  return record;
}

// --- LOGICA DI DECODIFICA (da anagraficaDecoders.ts) ---
const decodeTipoSoggetto = (codice) => 
  codice === '0' 
    ? { isPersonaFisica: true } 
    : { isPersonaFisica: false };

const formatNomeCompleto = (nome, cognome, denominazione, isPersonaFisica) => {
  if (isPersonaFisica) {
    return `${cognome || ''} ${nome || ''}`.trim();
  }
  return denominazione || '';
};

// --- LOGICA DI TRASFORMAZIONE (da anagraficaTransformer.ts con la patch) ---
function transformRecord(parsed) {
  const tipoSoggetto = decodeTipoSoggetto(parsed.tipoSoggetto);
  
  const nomeCompleto = formatNomeCompleto(
    parsed.nome,
    parsed.cognome,
    parsed.denominazione,
    tipoSoggetto.isPersonaFisica
  );

  const finalRecord = {
    codiceAnagrafica: parsed.codiceAnagrafica,
    isPersonaFisica: tipoSoggetto.isPersonaFisica,
    // LOGICA CORRETTA:
    nome: tipoSoggetto.isPersonaFisica
      ? nomeCompleto
      : parsed.denominazione || 'Soggetto senza nome',
    denominazione: parsed.denominazione || null,
    cognome: parsed.cognome || null,
    nomeOriginale: parsed.nome || null,
  };

  return finalRecord;
}


async function runTest() {
  console.log(`--- TEST DI VERIFICA FIX ANAGRAFICA ---`);
  
  try {
    // 1. Recupero definizioni dal DB
    console.log(`\n1. Caricamento definizioni per '${TEMPLATE_NAME}'...`);
    const fieldDefinitions = await prisma.fieldDefinition.findMany({
      where: { template: { name: TEMPLATE_NAME } },
      orderBy: { start: 'asc' },
    });
    if (!fieldDefinitions.length) throw new Error(`Nessuna definizione trovata.`);
    console.log(`Trovate ${fieldDefinitions.length} definizioni.`);

    // 2. Lettura file
    console.log(`\n2. Lettura file: ${FILE_PATH}`);
    const buffer = await fs.readFile(FILE_PATH);
    const fileContent = iconv.decode(buffer, 'latin1');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    console.log(`Lette ${lines.length} righe valide.`);

    // 3. Analisi dei record
    const recordsToTest = lines.slice(0, MAX_RECORDS_TO_TEST);
    console.log(`\n3. Analisi delle prime ${recordsToTest.length} righe...`);
    
    const testResults = [];
    for (const line of recordsToTest) {
      const parsedRecord = parseLine(line, fieldDefinitions);
      const finalRecord = transformRecord(parsedRecord);
      testResults.push(finalRecord);
    }
    
    console.log("\n--- RISULTATI DEL TEST ---");
    console.table(testResults.map(r => ({
        "Cod. Anagrafica": r.codiceAnagrafica,
        "Tipo": r.isPersonaFisica ? "Persona Fisica" : "Società/Ente",
        "NOME (FINALE)": r.nome,
        "Denominazione (orig.)": r.denominazione,
        "Cognome (orig.)": r.cognome,
        "Nome (orig.)": r.nomeOriginale,
    })));

  } catch (error) {
    console.error('\n\n❌ ERRORE CRITICO:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n--- TEST COMPLETATO ---');
  }
}

runTest(); 