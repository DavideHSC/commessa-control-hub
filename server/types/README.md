# Tipi TypeScript Condivisi (`/types`)

Questa cartella contiene le definizioni dei tipi TypeScript (`interface`, `type`) che sono condivise tra diversi moduli del backend. Centralizzare i tipi in questa directory aiuta a mantenere la consistenza e a ridurre la duplicazione del codice.

### File Principali

-   `reconciliation.ts`: Definisce le interfacce e i tipi di dati utilizzati specificamente nel processo di riconciliazione e allocazione dei movimenti contabili. Include le strutture per i riepiloghi (`ReconciliationSummaryData`), per le singole righe da processare (`RigaDaRiconciliare`) e per le statistiche generali di allocazione (`AllocationStats`). 