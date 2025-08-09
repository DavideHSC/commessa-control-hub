# Frontend Source (`/src`)

Questa cartella contiene tutto il codice sorgente per l'applicazione frontend, costruita con React, TypeScript e Vite.

## Struttura della Cartella

-   **`/api/`**: Contiene funzioni "wrapper" per effettuare chiamate all'API backend. Ogni file corrisponde a un gruppo di endpoint (es. `clienti.ts`, `commesse.ts`).
-   **`/components/`**: Ospita tutti i componenti React riutilizzabili dell'interfaccia utente. È ulteriormente suddivisa per funzionalità (es. `admin`, `dashboard`) e include una cartella `ui` per componenti di base generici (bottoni, card, etc.), basati su `shadcn/ui`.
-   **`/data/`**: Contiene dati statici o di mock, come `mock.ts`, utilizzati per lo sviluppo e i test.
-   **`/hooks/`**: Definisce i "custom hooks" di React per incapsulare e riutilizzare logiche complesse (es. `useAdvancedTable.ts` per la gestione di tabelle dati avanzate).
-   **`/lib/`**: Contiene utility e funzioni di supporto generiche (es. `utils.ts` per `cn`, una funzione per unire classi CSS).
-   **`/new_components/`**, **`/new_context/`**, **`/new_hooks/`**, **`/new_pages/`**: Queste cartelle contengono la nuova architettura del frontend, introdotta per un refactoring e una migliore organizzazione del codice. Seguono la stessa logica delle cartelle principali ma rappresentano la versione più recente e in via di sviluppo dell'interfaccia.
-   **`/pages/`**: Contiene i componenti React che rappresentano le pagine principali dell'applicazione (es. `Dashboard.tsx`, `Commesse.tsx`). Questa è l'architettura "legacy".
-   **`/schemas/`**: Definisce schemi di validazione (usando Zod) per i dati del database e dei form, garantendo la coerenza tra frontend e backend.

---

### File Principali

-   `App.tsx`: È il componente radice dell'applicazione. Definisce il routing principale utilizzando `react-router-dom`, imposta i provider di contesto (come `QueryClientProvider` per React Query e `CommessaProvider`) e gestisce la transizione tra la vecchia e la nuova architettura di layout/routing (rotte `/old` e `/new`).
-   `main.tsx`: È il punto di ingresso dell'applicazione. Esegue il rendering del componente `App` nel DOM.
-   `index.css`: Contiene gli stili globali e la configurazione di Tailwind CSS, incluse le variabili per il tema (light/dark). 