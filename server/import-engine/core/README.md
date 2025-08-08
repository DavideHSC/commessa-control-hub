# Core Engine

Questa directory contiene l'infrastruttura di base e i componenti condivisi che costituiscono il cuore dell'Import Engine. Le sue responsabilità includono la gestione dei processi, la telemetria e la definizione dei tipi di dati fondamentali.

## Struttura della Cartella

-   **`/errors/`**: Contiene un sistema gerarchico di errori strutturati per una gestione robusta delle eccezioni (attualmente vuota).
-   **`/jobs/`**: Fornisce la logica per la gestione e il tracciamento dei processi di importazione.
-   **`/services/`**: Destinata a contenere servizi condivisi e riutilizzabili all'interno dell'engine (attualmente vuota).
-   **`/telemetry/`**: Gestisce il logging strutturato e il monitoraggio delle performance.
-   **`/types/`**: Contiene i tipi TypeScript, in particolare quelli generati automaticamente.
-   `README.md`: Questo file.

---

### Sottocartelle

#### `/jobs/`

-   `ImportJob.ts`: Definisce la classe `ImportJob`, che modella un singolo processo di importazione. Questa classe è fondamentale per tracciare lo stato (`pending`, `running`, `completed`, `failed`), le metriche di performance (tempi, record processati) e gli eventuali errori di un job.

#### `/telemetry/`

-   `TelemetryService.ts`: Fornisce un servizio centralizzato per il logging strutturato. Permette di registrare eventi a diversi livelli (`info`, `warn`, `error`, `debug`) associati a un `jobId` specifico, facilitando il monitoraggio e il debugging dei processi di importazione.

#### `/types/`

-   `generated.ts`: **File autogenerato**. Contiene le interfacce TypeScript che rappresentano i dati grezzi (`Raw...`) letti dai file di importazione. Questo file **non deve essere modificato a mano**, ma viene rigenerato tramite lo script `npm run generate:import-types`, garantendo la coerenza tra il codice e le definizioni dei template nel database. 