# Analisi della Struttura del Progetto `commessa-control-hub`

Questo documento descrive la struttura delle cartelle e dei file principali del progetto, spiegando il ruolo di ciascun componente nell'architettura complessiva dell'applicazione.

## 1. Struttura ad Albero (Tree)

Di seguito è rappresentata la struttura gerarchica del progetto. Le cartelle come `.next`, `node_modules`, `.docs`, `backups` e `project_structure_split` sono state omesse per chiarezza, come richiesto.

```
commessa-control-hub/
├── .env
├── .gitignore
├── next.config.js
├── package.json
├── prisma/
│   ├── migrations/
│   │   └── ... (Cartelle e file delle singole migrazioni)
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── ... (Asset statici come immagini, font, etc.)
├── server/
│   └── import-engine/
│       ├── acquisition/
│       │   ├── definitions/
│       │   │   └── scrittureContabiliDefinitions.ts
│       │   └── validators/
│       │       └── scrittureContabiliValidator.ts
│       ├── consolidation/
│       │   └── ... (Logica di consolidamento dati)
│       └── processing/
│           └── ... (Logica di elaborazione dati)
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── ... (Pagine e layout protetti da autenticazione)
│   │   ├── api/
│   │   │   └── ... (API Routes per le operazioni di backend)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ... (Componenti UI riutilizzabili)
│   └── lib/
│       └── prisma.ts
└── tsconfig.json
```

## 2. Descrizione dei File e delle Cartelle

### Cartella Radice

*   `package.json`: Definisce i metadati del progetto, le dipendenze (es. React, Next.js, Prisma) e gli script per l'esecuzione di comandi comuni (es. `dev`, `build`, `start`).
*   `tsconfig.json`: File di configurazione per il compilatore TypeScript. Specifica le opzioni di compilazione e i percorsi dei file da includere.
*   `next.config.js`: File di configurazione per il framework Next.js. Permette di personalizzare il comportamento del server, del routing e del processo di build.
*   `.env`: Contiene le variabili d'ambiente sensibili e specifiche per ogni ambiente (sviluppo, produzione), come la stringa di connessione al database. **Non deve essere tracciato da Git.**
*   `.gitignore`: Specifica quali file e cartelle devono essere ignorati dal controllo di versione Git (es. `node_modules`, `.env`, `.next`).

### `prisma/`

*   `schema.prisma`: È il cuore della gestione del database. Definisce i modelli dei dati (che mappano le tabelle del database), le loro relazioni, il tipo di database (PostgreSQL) e la sua fonte di connessione.
*   `migrations/`: Contiene le migrazioni del database generate da Prisma. Ogni sottocartella rappresenta una migrazione e contiene il file SQL per applicare o annullare le modifiche allo schema.
*   `seed.ts`: (Opzionale) Uno script per popolare il database con dati iniziali o di test (es. utenti admin, dati di default).

### `public/`

*   Contiene tutti gli asset statici che devono essere serviti direttamente dal server web, come immagini, icone (favicon), e font.

### `server/`

*   `import-engine/`: Contiene la logica di backend dedicata all'importazione e all'elaborazione dei dati provenienti dai file di testo del cliente.
*   `import-engine/acquisition/`: Prima fase del motore di importazione. Si occupa di leggere i file sorgente e di estrarre i dati grezzi secondo le definizioni.
*   `import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts`: Definisce la struttura a larghezza fissa dei file di testo delle scritture contabili (es. `PNTESTA.TXT`), specificando nome, posizione iniziale e lunghezza di ogni campo.
*   `import-engine/acquisition/validators/scrittureContabiliValidator.ts`: Utilizza la libreria Zod per definire schemi di validazione. Garantisce che i dati estratti siano del tipo corretto e rispettino i vincoli richiesti prima di procedere con le fasi successive.
*   `import-engine/processing/`: Fase intermedia che trasforma i dati grezzi validati in un formato più strutturato, preparandoli per l'inserimento nelle tabelle di staging del database.
*   `import-engine/consolidation/`: Fase finale che prende i dati dalle tabelle di staging e li consolida nelle tabelle di produzione, risolvendo le relazioni (es. associando una scrittura al suo fornitore) e garantendo l'integrità dei dati.

### `src/`

*   `app/`: Directory principale dell'applicazione secondo l'App Router di Next.js. Contiene le pagine, i layout e le route.
*   `app/layout.tsx`: Il componente di layout radice che avvolge tutte le pagine dell'applicazione.
*   `app/page.tsx`: Il componente React che renderizza la homepage dell'applicazione.
*   `app/api/`: Contiene le API routes. Questi file definiscono endpoint server-side per gestire operazioni come il recupero dati, l'autenticazione o l'avvio del processo di importazione.
*   `components/`: Raccolta di componenti React riutilizzabili (es. bottoni, modali, tabelle, input) che compongono l'interfaccia utente.
*   `lib/`: Contiene utility e logica di supporto.
*   `lib/prisma.ts`: Inizializza e esporta un'istanza globale e singleton del client Prisma. Questo evita di creare nuove connessioni al database ad ogni richiesta, migliorando le performance.

---

## 3. Schema del Database e Scopo delle Tabelle

Di seguito è descritta la struttura logica delle tabelle principali del database, dedotta dai file di importazione e dalla logica dell'applicazione.

### Tabella: `AnagraficaClientiFornitori`

*   **Scopo**: Memorizza i dati anagrafici di clienti e fornitori importati dal file `A_CLIFOR.TXT`. Questi dati sono fondamentali per associare costi e ricavi a entità specifiche.

| Campo             | Descrizione                                           |
| ----------------- | ----------------------------------------------------- |
| `id`              | Chiave primaria (PK)                                  |
| `codice`          | Identificativo univoco proveniente dal gestionale     |
| `ragioneSociale`  | Nome o ragione sociale dell'entità                    |
| `partitaIva`      | Partita IVA                                           |
| `codiceFiscale`   | Codice Fiscale                                        |

### Tabella: `PianoDeiConti`

*   **Scopo**: Contiene il piano dei conti aziendale, importato da `ContiGen.txt`. È essenziale per la classificazione dei movimenti contabili.

| Campo         | Descrizione                                       |
| ------------- | ------------------------------------------------- |
| `id`          | PK                                                |
| `codice`      | Codice univoco del conto dal gestionale           |
| `descrizione` | Descrizione del conto (es. "Costi per materie prime") |

### Tabella: `CodiciIva`

*   **Scopo**: Archivia le diverse aliquote e codici IVA, importati da `CodicIva.txt`. Utilizzata per calcolare e registrare correttamente l'imposta sul valore aggiunto.

| Campo         | Descrizione                               |
| ------------- | ----------------------------------------- |
| `id`          | PK                                        |
| `codice`      | Codice univoco IVA dal gestionale         |
| `descrizione` | Descrizione del codice IVA                |
| `aliquota`    | Valore percentuale dell'aliquota          |

### Tabella: `CausaliContabili`

*   **Scopo**: Elenca le causali contabili (es. "Fattura di acquisto", "Pagamento"), importate da `Causali.txt`. Fornisce una descrizione standard per le registrazioni.

| Campo         | Descrizione                               |
| ------------- | ----------------------------------------- |
| `id`          | PK                                        |
| `codice`      | Codice univoco della causale              |
| `descrizione` | Descrizione della causale contabile       |

### Tabella: `ScritturaContabileTestata`

*   **Scopo**: Rappresenta la testata di una registrazione contabile, importata da `PNTESTA.TXT`. Raggruppa tutte le righe (conti, IVA, anagrafiche) di una singola operazione.

| Campo                 | Descrizione                                       |
| --------------------- | ------------------------------------------------- |
| `id`                  | PK                                                |
| `numeroRegistrazione` | Numero progressivo della registrazione            |
| `dataRegistrazione`   | Data della registrazione contabile                |
| `causaleId`           | Foreign Key (FK) a `CausaliContabili`             |

### Tabella: `ScritturaContabileRiga`

*   **Scopo**: Dettaglio di una registrazione contabile, importata da `PNRIGCON.TXT`. Contiene i movimenti Dare/Avere sui conti del `PianoDeiConti`.

| Campo         | Descrizione                               |
| ------------- | ----------------------------------------- |
| `id`          | PK                                        |
| `testataId`   | FK a `ScritturaContabileTestata`          |
| `contoId`     | FK a `PianoDeiConti`                      |
| `importoDare` | Importo in Dare                           |
| `importoAvere`| Importo in Avere                          |

### Tabella: `ScritturaContabileIva`

*   **Scopo**: Dettaglio IVA di una registrazione contabile, importato da `PNRIGIVA.TXT`. Specifica imponibile e imposta per ogni aliquota coinvolta.

| Campo         | Descrizione                               |
| ------------- | ----------------------------------------- |
| `id`          | PK                                        |
| `testataId`   | FK a `ScritturaContabileTestata`          |
| `codiceIvaId` | FK a `CodiciIva`                          |
| `imponibile`  | Importo imponibile                        |
| `imposta`     | Importo dell'imposta                      |

### Tabella: `MovimentoAnagrafica`

*   **Scopo**: Collega una registrazione contabile a un cliente o fornitore specifico, importato da `MOVANAC.TXT`.

| Campo                 | Descrizione                               |
| --------------------- | ----------------------------------------- |
| `id`                  | PK                                        |
| `testataId`           | FK a `ScritturaContabileTestata`          |
| `clienteFornitoreId`  | FK a `AnagraficaClientiFornitori`         |
| `riferimentoDocumento`| Riferimento al documento (es. numero fattura) |

### Tabella: `Commessa`

*   **Scopo**: Tabella centrale del progetto. Rappresenta una singola commessa o progetto. Viene popolata e gestita tramite l'interfaccia utente.

| Campo             | Descrizione                                       |
| ----------------- | ------------------------------------------------- |
| `id`              | PK                                                |
| `codice`          | Codice identificativo della commessa              |
| `descrizione`     | Descrizione estesa della commessa                 |
| `clienteId`       | FK a `AnagraficaClientiFornitori`                 |
| `importoPrevisto` | Valore economico previsto per la commessa         |

### Tabella: `CostoCommessa`

*   **Scopo**: Associa un costo, derivato da una `ScritturaContabileRiga`, a una specifica `Commessa`. Questa associazione avviene tramite l'interfaccia utente, permettendo di aggregare i costi per progetto.

| Campo             | Descrizione                                       |
| ----------------- | ------------------------------------------------- |
| `id`              | PK                                                |
| `commessaId`      | FK a `Commessa`                                   |
| `scritturaRigaId` | FK a `ScritturaContabileRiga`                     |
| `importo`         | L'importo del costo attribuito alla commessa      |
| `data`            | Data di attribuzione del costo                    |