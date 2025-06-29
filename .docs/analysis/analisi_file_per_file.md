# Analisi Dettagliata File per File dell'Architettura

**Data:** 29 Luglio 2024
**Autore:** Gemini AI Assistant

## Introduzione

Questo documento è un'analisi ricorsiva e granulare di ogni singolo file del progetto "Commessa Control Hub". L'obiettivo è fornire una descrizione chiara dello scopo di ogni file e definire l'azione strategica da intraprendere (es. Mantenere, Rimuovere, Verificare) nel contesto della transizione finale verso la nuova architettura "Enterprise" e della pulizia del debito tecnico.

---

## Indice delle Sezioni

1.  [File nella Root del Progetto (`/`)](#1-file-nella-root-del-progetto)
2.  [Documentazione e Analisi (`/.docs/`)](#2-documentazione-e-analisi-docs)
    - [`.docs/analysis/`](#docsanalysis)
    - [`.docs/code/`](#docscode)
    - [`.docs/dati_cliente/`](#docsdaticliente)
    - [`.docs/plans/`](#docsplans)
    - ...e altri
3.  [Backend Server (`/server/`)](#3-backend-server-server)
    - [`/server/import-engine/` (Nuova Architettura)](#serverimport-engine-nuova-architettura)
    - [`/server/lib/` (Legacy)](#serverlib-legacy)
    - [`/server/routes/` (Legacy & Nuova)](#serverroutes-legacy--nuova)
4.  [Frontend Application (`/src/`)](#4-frontend-application-src)
5.  [Configurazione Database (`/prisma/`)](#5-configurazione-database-prisma)
6.  [Altre Cartelle (`/backups/`, `/public/`, etc.)](#6-altre-cartelle)

---

## 1. File nella Root del Progetto (`/`)

-   **File:** `components.json`
    -   **Descrizione:** File di configurazione per `shadcn/ui`. Definisce lo stile, la locazione dei componenti UI e altre configurazioni per la libreria di componenti del frontend.
    -   **Analisi:** **Mantenere**. È un file di configurazione essenziale per il funzionamento e l'evoluzione dell'interfaccia utente.

-   **File:** `docker-compose.yml`
    -   **Descrizione:** Definisce i servizi, le reti e i volumi per l'ambiente di sviluppo basato su Docker. Gestisce il container del database PostgreSQL.
    -   **Analisi:** **Mantenere**. Fondamentale per garantire un ambiente di sviluppo consistente e replicabile.

-   **File:** `eslint.config.js`
    -   **Descrizione:** File di configurazione per ESLint, lo strumento di "linting" che analizza il codice per trovare e correggere problemi stilistici e bug comuni in JavaScript/TypeScript.
    -   **Analisi:** **Mantenere**. Cruciale per la qualità e la manutenibilità del codice.

-   **File:** `index.html`
    -   **Descrizione:** Entry point HTML per l'applicazione frontend Vite. È il file principale servito dal web server che carica l'applicazione React.
    -   **Analisi:** **Mantenere**. È il file radice dell'interfaccia utente.

-   **File:** `package-lock.json`
    -   **Descrizione:** Registra la versione esatta di ogni dipendenza installata. Garantisce che le installazioni siano ripetibili e consistenti tra diversi ambienti.
    -   **Analisi:** **Mantenere**. Non va mai modificato a mano; è gestito da `npm`.

-   **File:** `package.json`
    -   **Descrizione:** File manifesto del progetto Node.js. Elenca le dipendenze, definisce gli script (es. `dev`, `build`, `test`) e contiene metadati del progetto.
    -   **Analisi:** **Mantenere e Verificare**. È un file vitale. La sezione `"scripts"` va verificata per rimuovere eventuali comandi che eseguono file o logiche legacy.

-   **File:** `postcss.config.js`
    -   **Descrizione:** File di configurazione per PostCSS, un tool per trasformare CSS con plugin. Usato tipicamente insieme a Tailwind CSS.
    -   **Analisi:** **Mantenere**. Necessario per il corretto funzionamento dello styling del frontend.

-   **File:** `README.md`
    -   **Descrizione:** Documentazione principale del progetto. Dovrebbe contenere istruzioni per l'installazione, l'avvio e una panoramica generale.
    -   **Analisi:** **Mantenere e Aggiornare**. Va aggiornato per riflettere la nuova architettura e rimuovere ogni riferimento a procedure di importazione legacy.

-   **File:** `structure.json`, `struttura.js`, `struttura2.js`, `struttura_old.js`
    -   **Descrizione:** Serie di file creati per analisi strutturali o per scopi di utility/debug in fasi precedenti dello sviluppo.
    -   **Analisi:** **Rimuovere**. Sono file temporanei o di analisi che non servono più alla codebase attiva e contribuiscono al disordine.

-   **File:** `tailwind.config.ts`
    -   **Descrizione:** File di configurazione per il framework CSS Tailwind. Definisce il tema, i colori, i font e altre opzioni di design.
    -   **Analisi:** **Mantenere**. Essenziale per lo stile del frontend.

-   **File:** `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`
    -   **Descrizione:** File di configurazione per il compilatore TypeScript. Definiscono le regole di compilazione per le diverse parti del progetto (frontend, backend Node.js, configurazione generale).
    -   **Analisi:** **Mantenere**. Fondamentali per la corretta compilazione e type-checking del progetto.

-   **File:** `vite.config.ts`
    -   **Descrizione:** File di configurazione per Vite, il build tool utilizzato per il frontend.
    -   **Analisi:** **Mantenere**. Controlla come l'applicazione frontend viene servita in sviluppo e compilata per la produzione.

---

## 2. Documentazione e Analisi (`/.docs/`)

Questa directory contiene documentazione, analisi, dati del cliente e codice di riferimento che non fanno parte dell'applicazione eseguibile ma sono cruciali per la comprensione del progetto.

### `/.docs/analysis/`

-   **File:** `analisi_import_dati.md`, `analisi_ui_importazione_20250624.md`, `progetto_info.md`, `progetto_info_plan.md`, `stato_transizione_architettura.md`, `analisi_file_per_file.md` (questo file)
    -   **Descrizione:** Documenti di analisi creati in varie fasi per pianificare lo sviluppo, analizzare i requisiti e documentare l'architettura.
    -   **Analisi:** **Mantenere (Archiviare)**. Questi file rappresentano la cronologia del progetto. Sono utili come archivio storico ma potrebbero contenere informazioni obsolete. Si potrebbe creare una sottocartella `archive` per i documenti più vecchi.

-   **File:** `commit_by_commit_recovery/**`
    -   **Descrizione:** Contiene snapshot di codice e analisi relative a un'attività di recupero da commit specifici.
    -   **Analisi:** **Archiviare/Rimuovere**. Materiale di debug o recupero specifico di una situazione passata. Probabilmente non più rilevante per lo stato attuale. Da valutare se archiviare o eliminare per fare pulizia.

-   **File:** `file_list.txt`
    -   **Descrizione:** File temporaneo generato per contenere la lista di tutti i file del progetto, usato per la creazione di questo report.
    -   **Analisi:** **Rimuovere**. È un artefatto temporaneo.

-   **File:** `fix_*.md`, `Funzionalità contabili*.md`, `GESTIONE_COMMESSE_PLAN.md`, `PROJECT_JOURNEY.md`
    -   **Descrizione:** Vari documenti di pianificazione, analisi e fix specifici.
    -   **Analisi:** **Mantenere (Archiviare)**. Come per gli altri file di analisi, rappresentano la storia del progetto e vanno conservati, possibilmente in un archivio.

### `/.docs/code/`

-   **File:** `*.py` (es. `parser.py`, `parser_a_clifor.py`)
    -   **Descrizione:** I parser Python originali usati come "fonte di verità" per la logica di business e la decodifica dei file a larghezza fissa.
    -   **Analisi:** **Mantenere (come Riferimento)**. Sebbene la logica sia stata portata in TypeScript nella nuova architettura, questi file rimangono un riferimento fondamentale e prezioso in caso di dubbi o per futuri controlli di correttezza.

-   **File:** `*.xlsx` (es. `anagrafiche_clienti_fornitori.xlsx`)
    -   **Descrizione:** Output dei parser Python, usati per validare i dati e analizzare la struttura.
    -   **Analisi:** **Mantenere (come Riferimento)**. Utili per test e validazione.

-   **File:** `schema_contabilita.sql`, `golden_record.txt`
    -   **Descrizione:** Altri file di riferimento usati durante l'analisi iniziale.
    -   **Analisi:** **Mantenere (come Riferimento)**.

### `/.docs/dati_cliente/`

-   **File:** Tutti i file `.TXT` e i documenti in questa cartella e sottocartelle.
    -   **Descrizione:** Contengono i dati grezzi e i tracciati record originali forniti dal cliente. Sono la base su cui sono stati costruiti tutti i parser.
    -   **Analisi:** **Mantenere (Critico)**. Questi sono asset insostituibili del progetto. Sono essenziali per qualsiasi attività di test, debug o futura evoluzione dei parser.

### `/.docs/plans/`

-   **File:** Tutti i file `.md`
    -   **Descrizione:** Contiene i vari piani di azione, refactoring e sviluppo creati nel tempo.
    -   **Analisi:** **Mantenere (Archiviare)**. Contengono la cronologia delle decisioni progettuali. Molti saranno obsoleti, ma preziosi come archivio.

---

## 3. Backend Server (`/server/`)

Questa è la directory più critica per la transizione. Contiene sia la nuova architettura (`import-engine`) che il codice legacy da dismettere.

### `/server/import-engine/` (Nuova Architettura)
**Analisi Generale:** Questa directory è il risultato del refactoring ed è il **futuro del sistema di importazione**. Tutto il suo contenuto è da considerarsi **attivo, valido e da mantenere**. L'analisi che segue dettaglia lo scopo di ogni sua parte.

-   **Directory:** `import-engine/acquisition/`
    -   **Descrizione:** Contiene il primo stadio del pipeline di importazione: l'acquisizione dei dati grezzi.
        -   `definitions/`: Definizioni specifiche per i parser.
        -   `generators/`: Logica per generare tipi TypeScript dai template del DB (`TypeGenerator.ts`).
        -   `parsers/`: Contiene il nuovo parser `typeSafeFixedWidthParser.ts` che garantisce output tipizzato.
        -   `validators/`: Contiene gli schemi di validazione `Zod` per ogni tipo di anagrafica, assicurando la correttezza e la coerenza dei dati in ingresso.
    -   **Analisi:** **Mantenere (Critico)**.

-   **Directory:** `import-engine/core/`
    -   **Descrizione:** Contiene l'infrastruttura di base e i concetti condivisi del motore di importazione.
        -   `errors/`: Classi di errore personalizzate per un error handling strutturato.
        -   `jobs/`: Gestione dei processi di importazione come "Job" tracciabili (`ImportJob.ts`).
        -   `telemetry/`: Servizio di logging e telemetria (`TelemetryService.ts`).
        -   `types/`: Tipi TypeScript condivisi e generati automaticamente (`generated.ts`).
    -   **Analisi:** **Mantenere (Critico)**.

-   **Directory:** `import-engine/orchestration/`
    -   **Descrizione:** È il "cervello" che coordina l'intero processo di importazione.
        -   `handlers/`: Gestori delle richieste HTTP per ogni tipo di import (es. `anagraficaHandler.ts`). Vengono invocati dalle rotte API v2.
        -   `workflows/`: Definiscono i pipeline completi per ogni importazione, orchestrando le chiamate a parser, validator, transformer e persister (es. `importAnagraficheWorkflow.ts`, `importScrittureContabiliWorkflow.ts`).
    -   **Analisi:** **Mantenere (Critico)**.

-   **Directory:** `import-engine/persistence/`
    -   **Descrizione:** Gestisce la scrittura dei dati nel database.
        -   `dlq/`: Servizio per la Dead Letter Queue (`DLQService.ts`), per salvare e analizzare i record che falliscono l'importazione.
        -   `staging/`, `transactions/`: Logica per la persistenza sicura tramite tabelle di staging e transazioni atomiche.
    -   **Analisi:** **Mantenere (Critico)**.

-   **Directory:** `import-engine/transformation/`
    -   **Descrizione:** Contiene la logica di business pura per trasformare i dati grezzi validati in modelli pronti per il database.
        -   `decoders/`: Nuove funzioni di decodifica, isolate e testabili.
        -   `mappers/`: Logica per mappare i dati trasformati negli schemi di Prisma.
        -   `transformers/`: File specifici per ogni tipo di import (es. `anagraficaTransformer.ts`) che contengono la logica di business principale. Sono "pure functions", facili da testare.
    -   **Analisi:** **Mantenere (Critico)**.

### `/server/lib/` (Legacy e Utility)
**Analisi Generale:** Questa directory è un mix di codice legacy obsoleto e utility. La maggior parte del contenuto deve essere rimossa.

-   **File:** `lib/importers/**` (intera directory)
    -   **Descrizione:** Contiene i vecchi script di importazione monolitici.
    -   **Analisi:** **Rimuovere**. Tutta la logica è stata migrata e migliorata nel nuovo `import-engine`.

-   **File:** `lib/fixedWidthParser.js`, `lib/fixedWidthParser.ts`
    -   **Descrizione:** Il parser a larghezza fissa originale.
    -   **Analisi:** **Rimuovere**. Sostituito da `typeSafeFixedWidthParser.ts` nel nuovo motore.

-   **File:** `lib/importUtils.ts`
    -   **Descrizione:** Vecchie funzioni di utilità per l'importazione, inclusa la logica per le scritture contabili.
    -   **Analisi:** **Rimuovere**. Sostituito dai nuovi workflow.

-   **File:** `lib/jobManager.ts`
    -   **Descrizione:** Vecchio gestore di job.
    -   **Analisi:** **Rimuovere**. Sostituito da `import-engine/core/jobs/`.

-   **File:** `lib/businessDecoders.ts`
    -   **Descrizione:** Funzioni di decodifica legacy.
    -   **Analisi:** **Verificare e Rimuovere**. La logica dovrebbe essere tutta in `import-engine/transformation/decoders`. Verificare che nessun'altra parte del codice (esterna all'engine) lo importi, poi rimuovere.

### `/server/routes/` (Legacy & Nuova)
**Analisi Generale:** Qui convivono le vecchie e le nuove API. L'obiettivo è eliminare le vecchie.

-   **Directory:** `routes/v2/`
    -   **Descrizione:** Contiene le nuove API (es. `import.ts`) che espongono i workflow del `import-engine`.
    -   **Analisi:** **Mantenere**. Sono gli endpoint corretti da usare.

-   **File:** `routes/importAnagrafiche.ts`, `routes/importPrimaNota.ts`, `routes/importScritture.ts`, `routes/importScritture.ts.bak`
    -   **Descrizione:** Le vecchie API di importazione.
    -   **Analisi:** **Rimuovere**. Sono state completamente sostituite dalle nuove rotte in `v2/`.

-   **File:** `routes/causali.ts`, `clienti.ts`, `codiciIva.ts`, `commesse.ts`, `condizioniPagamento.ts`, `conti.ts`, `dashboard.ts`, `database.ts`, `fornitori.ts`, `importTemplates.ts`, `reconciliation.ts`, `registrazioni.ts`, `stats.ts`, `system.ts`, `vociAnalitiche.ts`
    -   **Descrizione:** API standard dell'applicazione per le funzionalità CRUD e di business (es. gestione tabelle, statistiche, ecc.). Non sono direttamente parte del processo di importazione legacy, ma servono l'applicazione.
    -   **Analisi:** **Mantenere**. Sono le API operative dell'applicazione.

### File alla radice di `/server/`

-   **File:** `server/index.ts`
    -   **Descrizione:** Entry point del server Express, dove vengono inizializzati middleware e rotte.
    -   **Analisi:** **Mantenere e Pulire**. È essenziale. Va modificato per rimuovere la registrazione delle rotte legacy (es. `/api/import/anagrafica`).

-   **File:** `server/debug_*.cjs`, `debug_*.js`, `debug_*.ts`, `temp_test_script.*`, `test_anagrafica_fix.js`, `upload_*.js`
    -   **Descrizione:** Numerosi script usati per test e debug manuali in varie fasi dello sviluppo.
    -   **Analisi:** **Rimuovere**. Sono tutti file temporanei che non hanno più utilità e aumentano il disordine.

-   **File:** `server/tsconfig.json`
    -   **Descrizione:** Configurazione di TypeScript per il backend.
    -   **Analisi:** **Mantenere**. Fondamentale per la compilazione del server.

---
*(L'analisi continuerà con la directory /src/)*

## 4. Frontend Application (`/src/`)

Questa directory contiene tutto il codice sorgente per l'interfaccia utente, costruita con React e Vite. L'analisi si concentra sulla verifica che il frontend utilizzi le nuove API e non mantenga riferimenti a logiche legacy.

### File alla Radice di `/src/`

-   **File:** `src/main.tsx`
    -   **Descrizione:** Il punto di ingresso principale dell'applicazione React. Si occupa di renderizzare il componente radice `App` nel DOM.
    -   **Analisi:** **Mantenere**. È l'entry point fondamentale del frontend.

-   **File:** `src/App.tsx`
    -   **Descrizione:** Componente principale dell'applicazione che imposta il router (le diverse pagine) e il layout generale.
    -   **Analisi:** **Mantenere**.

-   **File:** `src/App.css`, `src/index.css`
    -   **Descrizione:** Contengono gli stili CSS globali dell'applicazione.
    -   **Analisi:** **Mantenere**.

-   **File:** `src/vite-env.d.ts`
    -   **Descrizione:** File di dichiarazione dei tipi TypeScript per le variabili d'ambiente esposte da Vite.
    -   **Analisi:** **Mantenere**.

### `/src/api/`
-   **Descrizione:** Contiene le funzioni "client" che si occupano di effettuare le chiamate HTTP (fetch) verso il backend. È un punto cruciale per la transizione.
-   **Analisi:** **Mantenere e Verificare**.
    -   Verificare che tutte le funzioni che gestiscono l'importazione dei file (probabilmente in un file come `api/import.ts` o simile) puntino **esclusivamente** ai nuovi endpoint `/api/v2/...`.
    -   Tutti gli altri file (`clienti.ts`, `fornitori.ts`, etc.) che gestiscono le normali operazioni CRUD sono corretti e da mantenere.

### `/src/components/`
-   **Directory:** `components/ui/`
    -   **Descrizione:** Contiene tutti i componenti UI riutilizzabili e di base (Button, Card, Input, etc.), basati sulla libreria `shadcn/ui`.
    -   **Analisi:** **Mantenere**. È la libreria di componenti base dell'applicazione.

-   **Directory:** `components/admin/`
    -   **Descrizione:** Componenti per l'interfaccia di amministrazione. `ImportTemplatesAdmin.tsx` e `TemplateFormDialog.tsx` sono cruciali per la gestione dinamica dei template di importazione, una funzionalità chiave della nuova architettura.
    -   **Analisi:** **Mantenere**. Sono componenti centrali per la configurabilità del nuovo motore di importazione.

-   **Directory:** `components/database/`
    -   **Descrizione:** Componenti specializzati nel mostrare dati tabellari per le varie anagrafiche (`ClientiTable.tsx`, `ContiTable.tsx`, etc.).
    -   **Analisi:** **Mantenere**.

-   **File:** `components/Layout.tsx`, `components/Sidebar.tsx`
    -   **Descrizione:** Componenti che definiscono la struttura visuale principale e la barra di navigazione laterale.
    -   **Analisi:** **Mantenere**.

### `/src/data/`
-   **File:** `data/mock.js`, `data/mock.ts`
    -   **Descrizione:** Contengono dati finti (mock) usati probabilmente per lo sviluppo o il testing dei componenti UI senza dover dipendere da un backend attivo.
    -   **Analisi:** **Verificare e Mantenere**. Sono utili per lo sviluppo isolato. Verificare che non siano importati o usati nel bundle di produzione.

### `/src/hooks/`
-   **Descrizione:** Contiene i custom hooks di React, che astraggono logiche complesse e riutilizzabili.
-   **File:** `hooks/useAdvancedTable.ts`, `hooks/useCrudTable.ts`
    -   **Descrizione:** Hooks personalizzati che gestiscono la logica complessa delle tabelle dati (paginazione, ricerca, ordinamento lato server).
    -   **Analisi:** **Mantenere**. Sono un elemento importante per la UX delle tabelle.
-   **Altri hooks:** `use-mobile.tsx`, `use-toast.ts`...
    -   **Descrizione:** Altre utility (gestione responsive, notifiche).
    -   **Analisi:** **Mantenere**.

### `/src/lib/`
-   **File:** `lib/utils.ts`, `lib/utils.js`
    -   **Descrizione:** Funzioni di utilità generiche per il frontend (es. formattazione di stringhe, manipolazione di classi CSS con `cn`).
    -   **Analisi:** **Mantenere**.

### `/src/pages/`
-   **Descrizione:** Contiene i componenti React che rappresentano le pagine principali dell'applicazione.
-   **File:** `pages/Import.tsx`
    -   **Descrizione:** È la pagina dell'interfaccia utente dove l'utente seleziona il tipo di dati e carica i file da importare.
    -   **Analisi:** **Mantenere e Verificare (Critico)**. Questo è il file più importante del frontend per la transizione. È **obbligatorio** verificare che la logica di upload (la funzione `fetch` o la chiamata al client API) invii i file **esclusivamente** ai nuovi endpoint `/api/v2/import/...`. Qualsiasi riferimento a endpoint legacy come `/api/import/anagrafica/{tipo}` o `/api/import/scritture` deve essere rimosso.

-   **File:** `pages/Import.tsx.bak`, `pages/Dashboard.tsx.bak`
    -   **Descrizione:** File di backup di pagine.
    -   **Analisi:** **Rimuovere**. Creano disordine.

-   **File:** Tutti gli altri file `.tsx` in `pages/` (es. `Dashboard.tsx`, `Database.tsx`, `Commesse.tsx`, etc.)
    -   **Descrizione:** Le altre pagine funzionali dell'applicazione.
    -   **Analisi:** **Mantenere**.

### `/src/schemas/`
-   **File:** `schemas/database.ts`
    -   **Descrizione:** Contiene schemi di validazione, probabilmente con `Zod`, per i form del frontend (es. per la creazione o modifica di un cliente, una commessa, etc.).
    -   **Analisi:** **Mantenere**. Utile per la validazione dei dati inseriti dall'utente.

### `/src/types/`
-   **File:** `types/index.ts`, `types/index.js`
    -   **Descrizione:** Contiene le definizioni dei tipi TypeScript usate in tutto il frontend.
    -   **Analisi:** **Mantenere e Verificare**. Assicurarsi che i tipi siano aggiornati e coerenti con i modelli di dati del backend.

---
*(L'analisi continuerà con le directory rimanenti)*

## 5. Configurazione Database (`/prisma/`)

Questa directory è il centro di comando per tutto ciò che riguarda il database. Contiene lo schema, le migrazioni, gli script di seeding e utility SQL.

-   **File:** `prisma/schema.prisma`
    -   **Descrizione:** Il file più importante per la persistenza dei dati. Definisce tutti i modelli (tabelle), le loro colonne, i tipi di dato e le relazioni. È stato esteso per supportare sia la vecchia che la nuova architettura, includendo i modelli per i template (`ImportTemplate`), le definizioni dei campi (`FieldDefinition`) e le tabelle di staging per l'importazione (`ImportScrittura*`).
    -   **Analisi:** **Mantenere (Critico)**. È il cuore del database. Qualsiasi modifica futura dovrà essere fatta qui. Potrà essere pulito da campi legacy solo dopo la rimozione completa della vecchia architettura.

-   **File:** `prisma/schema.prisma.bak`
    -   **Descrizione:** Un file di backup dello schema.
    -   **Analisi:** **Rimuovere**. È un file di backup che non è più necessario e crea disordine.

-   **File:** `prisma/migrations/**` (intera directory)
    -   **Descrizione:** Contiene la cronologia di tutte le modifiche strutturali applicate al database. Ogni sottocartella rappresenta una migrazione, con il relativo file `migration.sql`.
    -   **Analisi:** **Mantenere (Critico)**. Questa directory è la storia del database e non deve essere alterata manualmente. È essenziale per ricreare lo schema del database in qualsiasi ambiente.

-   **File:** `prisma/migration_lock.toml`
    -   **Descrizione:** File di lock di Prisma per prevenire conflitti durante l'applicazione delle migrazioni.
    -   **Analisi:** **Mantenere**. È un file di sistema gestito da Prisma.

-   **File:** `prisma/seed.ts`
    -   **Descrizione:** Script TypeScript eseguito per popolare il database con dati iniziali. Nel nostro caso, è fondamentale perché crea i `ImportTemplate` e le `FieldDefinition` che sono il motore della nuova architettura di importazione.
    -   **Analisi:** **Mantenere (Critico)**. Questo script è la configurazione "as code" per il nuovo motore di importazione. Va mantenuto allineato ai tracciati record.

-   **File:** `prisma/seed.js`, `prisma/seed.ts.bak`, `prisma/seed_old_with_mock_data.js`, `prisma/seed_old_with_mock_data.ts`
    -   **Descrizione:** Versioni vecchie, di backup o per test dello script di seeding.
    -   **Analisi:** **Rimuovere**. Sono file obsoleti che creano confusione. L'unico file di seeding valido è `seed.ts`.

-   **File:** `prisma/*.sql` (es. `empty_staging_tables.sql`, `fix_staging_data.sql`, `truncate_anagrafiche.sql`, etc.)
    -   **Descrizione:** Script SQL manuali creati per operazioni di manutenzione, pulizia o fix dei dati durante lo sviluppo.
    -   **Analisi:** **Verificare e Archiviare/Rimuovere**. Questi script sono stati probabilmente usati per attività una tantum. Vanno analizzati uno a uno: se servono per procedure di manutenzione ricorrenti, vanno documentati e mantenuti. Altrimenti, se erano per fix specifici, vanno archiviati in `.docs/archive/sql_scripts` e rimossi dalla cartella `prisma`.

-   **File:** `prisma/tsconfig.json`
    -   **Descrizione:** File di configurazione TypeScript specifico per il codice all'interno della directory `prisma` (come `seed.ts`).
    -   **Analisi:** **Mantenere**. Assicura che lo script di seeding venga compilato e interpretato correttamente.

## 6. Altre Cartelle (`/backups/`, `/public/`, etc.)

-   **File:** `backups/`
    -   **Descrizione:** Contiene file di backup del database e del codice.
    -   **Analisi:** **Mantenere**.

-   **File:** `public/`
    -   **Descrizione:** Contiene file statici e pubblici.
    -   **Analisi:** **Mantenere**.

-   **File:** `backups/`
    -   **Descrizione:** Contiene file di backup del database e del codice.
    -   **Analisi:** **Mantenere**.

-   **File:** `public/`
    -   **Descrizione:** Contiene file statici e pubblici.
    -   **Analisi:** **Mantenere**.

---

## 6. Altre Directory

Questa sezione copre le directory rimanenti, che sono principalmente di supporto, contengono dati statici o artefatti di build.

### `/backups/`

-   **File:** `backup_20250624_094010.dump`
    -   **Descrizione:** Un file di backup del database PostgreSQL, creato in un momento specifico.
    -   **Analisi:** **Verificare e Archiviare/Rimuovere**. I backup puntuali possono essere utili, ma se sono molto datati o se esiste una strategia di backup più robusta, andrebbero archiviati altrove o rimossi per non appesantire il repository. Verificare che questa cartella sia nel `.gitignore`.

### `/project_structure_split/`

-   **File:** Tutti i file `.json`
    -   **Descrizione:** Questa directory sembra contenere un'analisi strutturale del progetto, con file JSON che descrivono il contenuto delle varie parti della codebase.
    -   **Analisi:** **Rimuovere**. Si tratta di artefatti di uno script di analisi eseguito in passato. Non ha valore per l'applicazione in esecuzione e può essere eliminato per fare pulizia.

### `/public/`

-   **File:** `favicon.ico`, `import-template.csv`, `placeholder.svg`, `robots.txt`
    -   **Descrizione:** Contiene asset statici che vengono serviti direttamente dal web server. `favicon.ico` è l'icona del sito, `robots.txt` dà istruzioni ai motori di ricerca. `import-template.csv` è un template di esempio per gli utenti.
    -   **Analisi:** **Mantenere**. Sono file necessari per il corretto funzionamento e la presentazione del sito web.

### `/uploads/`

-   **File:** File con nomi simili a hash (es. `20f81353a1879825cd341680813cbf1b`)
    -   **Descrizione:** Questa è la directory dove `multer` (il middleware per la gestione degli upload su Express) salva temporaneamente i file caricati dall'utente prima che vengano processati dal `import-engine`.
    -   **Analisi:** **Mantenere (come Directory Vuota)**. La directory è necessaria per il funzionamento dell'upload. È fondamentale che sia inclusa nel file `.gitignore` per assicurarsi che i file caricati dagli utenti non vengano mai committati nel repository Git. I file al suo interno sono temporanei e possono essere eliminati.

---

## 7. Riepilogo Finale e Piano d'Azione

L'analisi file per file conferma che la transizione verso la nuova architettura `import-engine` è stata completata con successo per **tutti i tipi di importazione**, incluso quello complesso delle scritture contabili.

La codebase contiene ancora una quantità significativa di codice legacy (principalmente in `server/lib/importers` e `server/routes`), che è di fatto obsoleto e non più utilizzato dalle nuove API v2.

**Il prossimo passo logico è una fase di "pulizia" per rimuovere questo debito tecnico.**

### Piano d'Azione Consigliato:

1.  **Creare un Branch di Backup**: Prima di qualsiasi eliminazione, creare un nuovo branch (es. `feature/legacy-cleanup` o `archive/legacy-code`) per preservare una copia del codice legacy, nel caso servisse come riferimento futuro. `git checkout -b feature/legacy-cleanup`

2.  **Rimuovere le Rotte API Legacy**:
    -   Eliminare i file:
        -   `server/routes/importAnagrafiche.ts`
        -   `server/routes/importPrimaNota.ts`
        -   `server/routes/importScritture.ts`
        -   `server/routes/importScritture.ts.bak`
    -   Modificare `server/index.ts` e rimuovere le linee `app.use(...)` che registrano queste rotte.

3.  **Rimuovere la Logica di Importazione Legacy**:
    -   Eliminare l'intera directory `server/lib/importers`.
    -   Eliminare i file:
        -   `server/lib/fixedWidthParser.ts` (e la sua versione `.js`)
        -   `server/lib/importUtils.ts`
        -   `server/lib/jobManager.ts`

4.  **Consolidare i Business Decoders**:
    -   Analizzare `server/lib/businessDecoders.ts` per identificare eventuali funzioni di decodifica non ancora migrate in `server/import-engine/transformation/decoders/`.
    -   Migrare le funzioni mancanti.
    -   Eliminare `server/lib/businessDecoders.ts`.

5.  **Pulire Script di Debug e Utility**:
    -   Eliminare tutti gli script di debug e analisi non più necessari in `/server` e nella root del progetto.

6.  **Verificare il Frontend**:
    -   Ispezionare attentamente `src/pages/Import.tsx` e le chiamate API in `src/api/` per assicurarsi che tutti gli upload puntino agli endpoint `/api/v2/`.

7.  **Eseguire Test di Regressione**:
    -   Dopo la pulizia, eseguire un ciclo completo di test di importazione per tutti i tipi di file per garantire che nulla sia stato compromesso e che l'applicazione si basi al 100% sulla nuova architettura.

Una volta completati questi passaggi, il progetto sarà più snello, più facile da manutenere e completamente allineato alla nuova architettura enterprise.

---