# Import Engine

Questa directory contiene la nuova architettura enterprise per l'importazione dei dati. È progettata per essere robusta, testabile, manutenibile e scalabile, seguendo i principi di:

-   **Correctness by Design**: L'uso di tipi e validazioni previene errori a monte.
-   **Flussi di dati unidirezionali**: I dati fluiscono in modo prevedibile attraverso layer specializzati.
-   **Integrità transazionale**: Le operazioni sul database sono atomiche.
-   **Osservabilità totale**: Logging e tracciamento strutturati.

## Architettura a Layer

L'engine è suddiviso in quattro layer principali, ognuno con una responsabilità specifica, per garantire una chiara separazione dei compiti.

### 1. Acquisition Layer

-   **Responsabilità:** Leggere i dati grezzi dalla fonte (file a larghezza fissa) e trasformarli in strutture dati TypeScript tipizzate.
-   **Contenuto:** Parsers, validatori Zod e script per la generazione automatica dei tipi.
-   **Cartella:** [`./acquisition/`](./acquisition/README.md)

### 2. Transformation Layer

-   **Responsabilità:** Applicare la logica di business. Riceve i dati validati dal layer di acquisizione e li trasforma in modelli pronti per essere salvati nel database. Le funzioni in questo layer sono pure e senza effetti collaterali.
-   **Contenuto:** Transformers, decoders per valori legacy e mappers verso i modelli Prisma.
-   **Cartella:** [`./transformation/`](./transformation/README.md)

### 3. Persistence Layer

-   **Responsabilità:** Salvare i dati trasformati nel database in modo sicuro e transazionale.
-   **Contenuto:** Logica per le tabelle di staging, pattern transazionali (Staging-Commit) e gestione della Dead Letter Queue (DLQ) per i record falliti.
-   **Cartella:** [`./persistence/`](./persistence/README.md)

### 4. Orchestration Layer

-   **Responsabilità:** Coordinare i tre layer sottostanti per eseguire un intero processo di importazione. Agisce come il "direttore d'orchestra".
-   **Contenuto:** Workflow completi per ogni tipo di importazione, handler per le rotte API Express e middleware specifici.
-   **Cartella:** [`./orchestration/`](./orchestration/README.md)

### Core

-   **Responsabilità:** Contenere l'infrastruttura di base e i componenti condivisi tra i vari layer.
-   **Contenuto:** Tipi generati, un sistema gerarchico di errori, gestione dei job di importazione e servizi di telemetria.
-   **Cartella:** [`./core/`](./core/README.md) 