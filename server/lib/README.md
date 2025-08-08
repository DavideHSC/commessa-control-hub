# Librerie Condivise (`/lib`)

Questa cartella contiene moduli e utility condivise utilizzate in diverse parti del backend. Include sia la logica di business riutilizzabile che le funzioni di supporto tecnico.

## Struttura della Cartella

-   **`/importers/`**: [Vedi README](./importers/README.md) - Contiene la logica di importazione legacy, specifica per ogni tipo di anagrafica.

---

### File Principali

-   `businessDecoders.ts`: Un modulo cruciale che contiene tutte le funzioni per decodificare i valori "legacy" provenienti dai file di testo in formati semanticamente corretti e leggibili. Questa logica è basata sui parser Python originali e garantisce la coerenza nell'interpretazione dei dati.

-   `fixedWidthParser.ts`: Contiene il parser principale per i file a larghezza fissa. Include sia una versione legacy che una nuova versione robusta (`parseFixedWidthRobust`) che gestisce fallback di encoding, validazione della lunghezza dei record e caricamento delle definizioni dei campi dal database.

-   `importUtils.ts`: Fornisce una serie di funzioni di utilità per il processo di importazione, come la conversione di stringhe di data, il parsing di flag booleani (`'X'`, `'S'`) e la gestione di valori numerici con decimali.

-   `jobManager.ts`: (Legacy) Implementa un semplice gestore di processi (job) basato su `EventEmitter` per tracciare lo stato delle operazioni di importazione. Utilizzato principalmente per notificare l'avanzamento tramite Server-Sent Events (SSE).

### Logica di Finalizzazione

Questi file gestiscono il processo di "finalizzazione", ovvero il trasferimento dei dati dalle tabelle di *staging* alle tabelle di produzione definitive.

-   `finalization.ts`: Contiene la logica originale per il processo di finalizzazione. Include la funzione `cleanSlateReset` per svuotare le tabelle di produzione e funzioni specifiche per finalizzare anagrafiche, causali, scritture, ecc.

-   `finalization_fixed.ts`: Una versione corretta della logica di finalizzazione che introduce controlli sui duplicati (pattern `upsert`) per evitare la creazione di record duplicati durante importazioni multiple.

-   `finalization_optimized.ts`: Un'ulteriore evoluzione della logica di finalizzazione, ottimizzata per prevenire timeout del database e deadlock durante operazioni massive. Suddivide le operazioni in batch più piccoli e separa le transazioni per migliorare la robustezza. 