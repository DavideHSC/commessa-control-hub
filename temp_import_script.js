const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000/api/import/anagrafiche/piano_dei_conti';
const FILE_PATH = path.join(__dirname, 'uploads', 'ContiGen.txt');

async function importFile() {
    console.log(`Tentativo di importare il file: ${FILE_PATH}`);

    if (!fs.existsSync(FILE_PATH)) {
        console.error('Errore: File non trovato. Assicurati che il file si trovi in /uploads/ContiGen.txt');
        return;
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(FILE_PATH));

    try {
        console.log(`Invio richiesta POST a: ${API_URL}`);
        const response = await fetch(API_URL, {
            method: 'POST',
            body: form
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log('Importazione completata con successo!');
            console.log('Risultato:', JSON.stringify(responseData, null, 2));
        } else {
            console.error(`Errore durante l'importazione. Status: ${response.status}`);
            console.error('Dettagli errore:', JSON.stringify(responseData, null, 2));
        }
    } catch (error) {
        console.error('Errore fatale durante l\'esecuzione dello script di importazione:', error);
    }
}

importFile(); 