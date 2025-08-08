# Componenti React (`/components`)

Questa directory contiene tutti i componenti React riutilizzabili che compongono l'interfaccia utente dell'applicazione. La struttura segue una logica di raggruppamento per funzionalità o per tipologia di componente.

## Struttura della Cartella

-   **`/admin/`**: Componenti specifici per le sezioni di amministrazione e configurazione (es. gestione dei template di import, form per la rilevanza dei conti).
-   **`/allocation/`**: Componenti dedicati al processo di allocazione e riconciliazione (es. widget di riepilogo, suggerimenti intelligenti).
-   **`/classification/`**: (Attualmente vuota) Destinata a contenere componenti per la classificazione dei dati.
-   **`/commesse/`**: Componenti specifici per la visualizzazione e la gestione delle commesse (es. card di performance, menu di azioni).
-   **`/dashboard/`**: Componenti utilizzati per costruire la dashboard principale (es. pannello alert, contenitori per grafici).
-   **`/database/`**: Componenti per la visualizzazione e la gestione delle tabelle del database (es. `ClientiTable`, `CausaliTable`).
-   **`/dialogs/`**: Componenti modali e dialoghi riutilizzabili (es. `EditBudgetDialog`).
-   **`/layout/`**: Componenti che definiscono la struttura principale delle pagine (es. `TabbedViewLayout`).
-   **`/ui/`**: Componenti di base e generici dell'interfaccia utente, basati su **shadcn/ui**. Questi sono i mattoni fondamentali (es. `Button`, `Card`, `Input`, `Table`).

---

### File Principali

-   `Layout.tsx`: Definisce il layout principale dell'applicazione (versione "legacy"), che include la `Sidebar` e un'area centrale (`Outlet`) dove vengono renderizzate le diverse pagine.
-   `Sidebar.tsx`: Il componente della barra di navigazione laterale (versione "legacy"), con tutti i link alle varie sezioni dell'applicazione. 