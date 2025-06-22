// struttura.js (versione con esclusioni avanzate per cartelle e estensioni)

import fs from 'fs';
import path from 'path';

// --- CONFIGURAZIONE ---
const ROOT_DIR = process.cwd(); 
const OUTPUT_FILE = 'structure.json';

// Lista di cartelle o file da ignorare per NOME ESATTO
const IGNORE_LIST = [
  'node_modules',
  '.git',
  '.vscode',
  'dist',
  'build',
  '.env',
  'package-lock.json',
  'bun.lockb',
  'ilovepdf_pages-to-jpg', // <-- AGGIUNTO: ignorerà questa cartella specifica
  // Se volessi ignorare TUTTA la cartella .docs, scriveresti '.docs'
  OUTPUT_FILE,
  'struttura.js'
];

// NUOVA LISTA: Estensioni di file da ignorare (scrivere in minuscolo, con il punto)
const IGNORE_EXTENSIONS = [
  // Immagini
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.ico',
  // Documenti
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // Archivi compressi
  '.zip', '.rar', '.7z', '.tar', '.gz',
  // Font
  '.woff', '.woff2', '.ttf', '.eot',
  // File audio/video
  '.mp3', '.wav', '.mp4', '.mov', '.webm'
];
// --------------------

function main() {
  console.log('Inizio la generazione della struttura del progetto...');
  
  let totalTokenEstimate = 0;

  function analizzaCartella(directoryPath) {
    const items = fs.readdirSync(directoryPath);
    const children = [];

    for (const item of items) {
      if (IGNORE_LIST.includes(item)) {
        continue;
      }

      const itemPath = path.join(directoryPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        children.push({
          name: item,
          type: 'directory',
          children: analizzaCartella(itemPath)
        });
      } else if (stats.isFile()) {
        
        // NUOVO CONTROLLO: Salta il file se la sua estensione è nella lista di quelle da ignorare
        const extension = path.extname(item).toLowerCase();
        if (IGNORE_EXTENSIONS.includes(extension)) {
          console.log(`- Escluso (estensione): ${path.relative(ROOT_DIR, itemPath)}`);
          continue; // Salta al prossimo file
        }

        let content;
        let fileTokenEstimate = 0;
        try {
          content = fs.readFileSync(itemPath, 'utf-8');
          content = content.replace(/\r\n/g, '\n'); 
          fileTokenEstimate = Math.ceil(content.length / 4);
          totalTokenEstimate += fileTokenEstimate;

          const relativePath = path.relative(ROOT_DIR, itemPath);
          console.log(`- Analizzato: ${relativePath.padEnd(60)} (~${fileTokenEstimate} tokens)`);

        } catch (error) {
          // Questo blocco ora gestirà principalmente errori su file che sembravano testo ma non lo erano
          console.log(`- Errore di lettura (file binario?): ${path.relative(ROOT_DIR, itemPath)}`);
          content = `[Errore durante la lettura del file (probabilmente binario): ${error.message}]`;
        }
        children.push({
          name: item,
          type: 'file',
          token_estimate: fileTokenEstimate,
          content: content
        });
      }
    }
    return children;
  }

  try {
    const projectChildren = analizzaCartella(ROOT_DIR);
    const strutturaProgetto = {
      name: path.basename(ROOT_DIR),
      type: 'directory',
      total_token_estimate: totalTokenEstimate, 
      children: projectChildren
    };

    const jsonContent = JSON.stringify(strutturaProgetto, null, 2);
    fs.writeFileSync(path.join(ROOT_DIR, OUTPUT_FILE), jsonContent);

    console.log('\n--------------------------------------------------');
    console.log(`✅ STIMA TOTALE TOKEN: ~${totalTokenEstimate} tokens`);
    console.log(`✅ Struttura del progetto salvata con successo in ${OUTPUT_FILE}`);
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('❌ Si è verificato un errore durante la generazione della struttura:', error);
  }
}

main();