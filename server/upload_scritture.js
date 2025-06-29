
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

async function uploadScritture() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const basePath = path.join(__dirname, '..', '.docs', 'dati_cliente', 'prima_nota');
  const url = 'http://localhost:3001/api/v2/import/scritture-contabili';

  const files = [
    { name: 'pntesta', path: path.join(basePath, 'PNTESTA.TXT') },
    { name: 'pnrigcon', path: path.join(basePath, 'PNRIGCON.TXT') },
    { name: 'pnrigiva', path: path.join(basePath, 'PNRIGIVA.TXT') },
    { name: 'movanac', path: path.join(basePath, 'MOVANAC.TXT') },
  ];

  try {
    const formData = new FormData();
    
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        formData.append(file.name, fs.createReadStream(file.path));
      } else {
        console.warn(`Attenzione: file non trovato e non verrà inviato: ${file.path}`);
      }
    });

    console.log(`Uploading files to ${url}...`);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();
    console.log('Upload successful:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error during upload:', error);
  }
}

uploadScritture();
