import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

async function uploadCausali() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, '..', '.docs', 'dati_cliente', 'Causali.txt');
  const url = 'http://localhost:3001/api/import/anagrafiche/causali';

  try {
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('file', fileStream, 'Causali.txt');

    console.log(`Uploading ${filePath} to ${url}...`);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Error during upload:', error);
  }
}

uploadCausali();