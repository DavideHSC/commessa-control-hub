// struttura.js (versione finale con modalità --split e manifest)

import fs from 'fs';
import path from 'path';

// --- CONFIGURAZIONE ---
const ROOT_DIR = process.cwd(); 
const IGNORE_LIST = [
  'node_modules', '.git', '.vscode', 'dist', 'build', '.env', 'package-lock.json', 'bun.lockb',
  'ilovepdf_pages-to-jpg'
];
const IGNORE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.doc', '.docx', '.zip', '.rar',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mov'
];

// Leggi i parametri dalla linea di comando
const args = process.argv.slice(2);
const shouldSplit = args.includes('--split');

const SINGLE_OUTPUT_FILE = 'structure.json';
const SPLIT_OUTPUT_DIR = 'project_structure_split';

/**
 * Funzione di analisi principale.
 * Ora restituisce sia l'albero della struttura che la stima totale dei token.
 */
function analizzaRicorsivamente(directoryPath) {
  let totalTokens = 0;
  
  function analizza(currentPath) {
    const items = fs.readdirSync(currentPath);
    const children = [];

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const relativePath = path.relative(ROOT_DIR, itemPath);

      if (IGNORE_LIST.some(ignored => relativePath.startsWith(ignored))) {
        continue;
      }
      
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        children.push({ name: item, type: 'directory', children: analizza(itemPath) });
      } else if (stats.isFile()) {
        const extension = path.extname(item).toLowerCase();
        if (IGNORE_EXTENSIONS.includes(extension)) {
          continue;
        }

        let content, fileTokenEstimate = 0;
        try {
          content = fs.readFileSync(itemPath, 'utf-8').replace(/\r\n/g, '\n');
          fileTokenEstimate = Math.ceil(content.length / 4);
          totalTokens += fileTokenEstimate;
        } catch (error) {
          content = `[Errore lettura file: ${error.message}]`;
        }
        
        children.push({ name: item, type: 'file', token_estimate: fileTokenEstimate, content: content });
      }
    }
    return children;
  }

  const tree = analizza(directoryPath);
  return { tree, totalTokens };
}

function runSingleFileMode() {
  console.log('Modalità file singolo. Genero structure.json...');
  
  // Ignoriamo lo stesso file di output
  if (!IGNORE_LIST.includes(SINGLE_OUTPUT_FILE)) IGNORE_LIST.push(SINGLE_OUTPUT_FILE);

  const { tree, totalTokens } = analizzaRicorsivamente(ROOT_DIR);
  const projectStructure = {
    name: path.basename(ROOT_DIR),
    type: 'directory',
    total_token_estimate: totalTokens,
    children: tree
  };

  fs.writeFileSync(SINGLE_OUTPUT_FILE, JSON.stringify(projectStructure, null, 2));
  console.log(`\n✅ Struttura completa salvata in ${SINGLE_OUTPUT_FILE} (~${totalTokens} tokens)`);
}

function runSplitMode() {
  console.log(`Modalità split. Genero file separati nella cartella '${SPLIT_OUTPUT_DIR}'...`);
  
  // Pulisci e crea la cartella di output
  if (fs.existsSync(SPLIT_OUTPUT_DIR)) fs.rmSync(SPLIT_OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(SPLIT_OUTPUT_DIR, { recursive: true });

  // Ignoriamo la cartella di output stessa
  if (!IGNORE_LIST.includes(SPLIT_OUTPUT_DIR)) IGNORE_LIST.push(SPLIT_OUTPUT_DIR);
  
  const manifest = { project_name: path.basename(ROOT_DIR), total_project_tokens: 0, files: [] };
  const rootItems = fs.readdirSync(ROOT_DIR);

  const rootLevelFiles = [];
  const rootLevelDirs = [];

  rootItems.forEach(item => {
    if (IGNORE_LIST.includes(item)) return;
    const stats = fs.statSync(path.join(ROOT_DIR, item));
    if (stats.isDirectory()) rootLevelDirs.push(item);
    else if (stats.isFile()) rootLevelFiles.push(item);
  });
  
  // 1. Processa le cartelle di root
  rootLevelDirs.forEach(dirName => {
    console.log(`- Analizzo la cartella: ${dirName}`);
    const { tree, totalTokens } = analizzaRicorsivamente(path.join(ROOT_DIR, dirName));
    const structure = { name: dirName, type: 'directory', total_token_estimate: totalTokens, children: tree };
    const outputFileName = `${dirName.replace(/^\./, '_')}.json`; // Sostituisce '.' iniziale (es .docs -> _docs)
    fs.writeFileSync(path.join(SPLIT_OUTPUT_DIR, outputFileName), JSON.stringify(structure, null, 2));
    
    manifest.files.push({ file: outputFileName, type: 'directory', token_estimate: totalTokens });
    manifest.total_project_tokens += totalTokens;
  });

  // 2. Processa i file di root
  if (rootLevelFiles.length > 0) {
    console.log(`- Analizzo i file di root...`);
    const { tree, totalTokens } = analizzaRicorsivamente(ROOT_DIR);
    // Filtriamo per mantenere solo i file e non le cartelle già processate
    const onlyRootFiles = tree.filter(node => node.type === 'file');
    const structure = { name: '_root', type: 'collection', total_token_estimate: totalTokens, children: onlyRootFiles };
    const outputFileName = '_root.json';
    fs.writeFileSync(path.join(SPLIT_OUTPUT_DIR, outputFileName), JSON.stringify(structure, null, 2));

    manifest.files.push({ file: outputFileName, type: 'root_files', token_estimate: totalTokens });
    manifest.total_project_tokens += totalTokens;
  }

  // 3. Scrivi il manifest
  fs.writeFileSync(path.join(SPLIT_OUTPUT_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('\n--------------------------------------------------');
  console.log(`✅ Operazione completata. Totale Progetto: ~${manifest.total_project_tokens} tokens`);
  console.log(`✅ Controlla la cartella '${SPLIT_OUTPUT_DIR}' per i file generati.`);
  console.log('✅ Il file `_manifest.json` contiene il riepilogo.');
  console.log('--------------------------------------------------');
}

// --- ESECUZIONE ---
if (shouldSplit) {
  runSplitMode();
} else {
  runSingleFileMode();
}