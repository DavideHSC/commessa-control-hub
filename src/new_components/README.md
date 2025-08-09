# Nuovi Componenti React (`/new_components`)

Questa directory fa parte della **nuova architettura** del frontend e contiene una versione riorganizzata e più strutturata dei componenti React. L'obiettivo è migliorare la manutenibilità, la riusabilità e la separazione delle responsabilità rispetto alla cartella `/components` legacy.

## Struttura della Cartella

-   **`/dialogs/`**: Contiene componenti specializzati per la gestione di dialoghi e modali (es. `ConfirmDialog`, `ProgressDialog`).
-   **`/forms/`**: Ospita componenti dedicati alla gestione di form complessi (es. `AllocationForm`, `BudgetForm`, `GenericForm`).
-   **`/layout/`**: Definisce i componenti per la struttura principale dell'applicazione nella nuova architettura (es. `NewLayout`, `NewHeader`, `NewSidebar`).
-   **`/shared/`**: (Attualmente vuota) Destinata a contenere componenti generici e condivisi tra diverse funzionalità.
-   **`/tables/`**: Contiene componenti per la visualizzazione di dati tabellari, come `UnifiedTable`, che astrae la logica di visualizzazione, paginazione e ricerca.
-   **`/ui/`**: Simile alla controparte in `/components`, contiene i componenti di base dell'interfaccia utente (es. `Button`, `Card`), probabilmente con stili o logiche aggiornate per la nuova architettura. 