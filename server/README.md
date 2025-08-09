# Backend Server

Questa cartella contiene tutto il codice sorgente per il backend dell'applicazione, basato su Node.js e Express.

## Struttura della Cartella

-   **`/import-engine/`**: [Vedi README](./import-engine/README.md) - Contiene la nuova architettura per l'importazione dei dati.
-   **`/lib/`**: [Vedi README](./lib/README.md) - Contiene librerie condivise, utility e la logica di importazione legacy.
-   **`/routes/`**: [Vedi README](./routes/README.md) - Definisce tutti gli endpoint dell'API REST.
-   **`/types/`**: [Vedi README](./types/README.md) - Contiene definizioni di tipi TypeScript condivise.

---

### File Principali

-   `index.ts`: È il punto di ingresso principale del server. Inizializza l'applicazione Express, imposta i middleware (CORS, JSON), registra tutte le rotte API e avvia il server. Contiene anche una rotta di test temporanea per l'importazione delle scritture.

### Script di Debug

Questa cartella contiene diversi script autonomi utilizzati per testare e validare specifiche funzionalità in un ambiente isolato.

-   `debug_anagrafica_parser.cjs`: Uno script in formato CommonJS per testare il parsing di record specifici dal file delle anagrafiche (`A_CLIFOR.TXT`) utilizzando il `fixedWidthParser`.
-   `debug_currency_validation.ts`: Script di validazione per testare la trasformazione e la gestione degli importi in valuta, in particolare per risolvere problemi legati ai decimali impliciti.
-   `debug_movimento_specifico.ts`: Script di debug per analizzare in profondità una specifica scrittura contabile (movimento) che presenta problemi di sbilanciamento, interrogando direttamente il database.
-   `debug_scritture.ts`: Script di test per il parser a larghezza fissa applicato ai 4 file delle scritture contabili (`PNTESTA`, `PNRIGCON`, `PNRIGIVA`, `MOVANAC`), utilizzando dati di esempio per verificare la correttezza dell'estrazione.
-   `temp_test_script.ts`: Script temporaneo per eseguire e testare il workflow completo di importazione delle scritture contabili (`ImportScrittureContabiliWorkflow`) in un ambiente di sviluppo locale.

### File di Configurazione

-   `.eslintrc.json`: File di configurazione per ESLint. Definisce le regole di linting per il codice TypeScript del backend, assicurando consistenza e qualità del codice.
-   `tsconfig.json`: File di configurazione per il compilatore TypeScript. Specifica le opzioni di compilazione, come la versione di ECMAScript di destinazione, la risoluzione dei moduli, e i percorsi dei file sorgente. 