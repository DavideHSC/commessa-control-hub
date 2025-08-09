# API Layer (`/api`)

Questa directory funge da **Data Access Layer** per il frontend. Contiene tutte le funzioni necessarie per comunicare con l'API REST del backend. Ogni file in questa cartella raggruppa le chiamate relative a una specifica risorsa (es. `clienti.ts`, `commesse.ts`).

## Pattern Utilizzati

-   **Funzioni Wrapper**: Ogni funzione esportata incapsula una chiamata `fetch` a un endpoint specifico del backend, gestendo la richiesta, la risposta e la gestione base degli errori.
-   **Tipi Condivisi**: Vengono importati e utilizzati i tipi di dati definiti da Prisma (es. `Cliente`, `Commessa`) per garantire la coerenza tra frontend e backend.
-   **Modularità**: Le chiamate sono raggruppate per risorsa, rendendo il codice più organizzato e facile da mantenere. Il file `index.ts` agisce da punto di ingresso principale, riesportando le funzioni degli altri moduli per un accesso semplificato.

## File Principali

-   `index.ts`: Punto di ingresso principale per il layer API. Definisce utility generiche come `fetchData` e `fetchPaginatedData`, configura un'istanza di `axios` (`apiClient`) e riesporta le funzioni degli altri file come "namespace" (es. `clienti.createCliente`). Contiene anche funzioni per operazioni di sistema come `resetDatabase` e `getDatabaseStats`.

### Gestione Anagrafiche

-   `clienti.ts`: Funzioni CRUD (Create, Read, Update, Delete) per la risorsa `Cliente`.
-   `fornitori.ts`: Funzioni CRUD per la risorsa `Fornitore`.
-   `conti.ts`: Funzioni CRUD per il `Piano dei Conti`, inclusa la logica per attivare/disattivare la rilevanza di un conto per le commesse (`toggleContoRelevance`).
-   `causali.ts`, `codiciIva.ts`, `condizioniPagamento.ts`: Funzioni CRUD per le rispettive anagrafiche.
-   `registrazioni.ts`: Funzioni CRUD per le `ScrittureContabili` (chiamate "registrazioni" nel frontend).
-   `vociAnalitiche.ts`: Funzioni CRUD per le `VociAnalitiche`.
-   `regoleRipartizione.ts`: Funzioni CRUD per le `RegoleRipartizione`.

### Gestione Commesse e Performance

-   `commesse.ts`: Funzioni CRUD di base per la risorsa `Commessa`. Fornisce anche una funzione `getCommesseForSelect` per popolare le dropdown.
-   `commessePerformance.ts`: Contiene la chiamata per ottenere le commesse arricchite con i dati di performance (costi, ricavi, margine), utilizzata principalmente nella dashboard.

### Processi Operativi

-   `reconciliation.ts`: Funzioni per il processo di riconciliazione, come `runReconciliation` per avviare l'analisi e `saveManualAllocation` per salvare le allocazioni manuali.
-   `importTemplates.ts`: Funzioni CRUD per i template di importazione dei file a larghezza fissa.

### Operazioni di Sistema

-   `database.ts`: Contiene funzioni per operazioni "pericolose" sul database, come `clearScrittureContabili` e `clearCondizioniPagamento`, che vengono richiamate da pannelli di amministrazione. 