# Fase 4 - Piano Miglioramento Tabelle e UX

- **Stato Finale:** `COMPLETED`
- **Riepilogo:** Tutti i task sono stati completati. Le API sono state standardizzate, l'hook `useAdvancedTable` e il componente `AdvancedDataTable` sono stati implementati e adottati in tutta l'applicazione, e il codice obsoleto è stato rimosso.

Questo piano formalizza e integra il documento `ux_table_improvements_plan.md` nel nostro framework di sviluppo strategico.

## 1. Analisi dello Stato Attuale della Codebase

### a. Componenti Tabella (`src/components/database/`, `src/pages/`)
*   **Stato Attuale:** Le tabelle presenti nell'applicazione (es. `ClientiTable`, `ContiTable`) utilizzano un componente `DataTable` di base (`src/components/ui/data-table.tsx`). Questo componente renderizza **tutti i dati che riceve in un'unica passata**.
*   **Valutazione:** Questa implementazione è **criticamente inefficiente** e non scalabile. Con un dataset reale (es. 3190 conti), il browser tenterebbe di renderizzare migliaia di righe DOM, portando a rallentamenti gravi o al crash della pagina. La mancanza di paginazione, ricerca e filtri rende le tabelle **inutilizzabili** per scopi pratici.

### b. Logica di Business e API (`server/`)
*   **Stato Attuale:** Gli endpoint API (es. `GET /api/conti`) restituiscono l'**intero dataset** senza alcun supporto per la paginazione, l'ordinamento o il filtraggio lato server.
*   **Valutazione:** L'infrastruttura API è **inadeguata** a supportare un'interfaccia utente performante. Trasferire migliaia di record in una singola richiesta HTTP è inefficiente e lento.

## 2. Identificazione delle Lacune Funzionali

1.  **Manca un componente tabella avanzato** che gestisca la paginazione, la ricerca e i filtri.
2.  **Mancano le API backend** in grado di servire i dati in "pezzi" (pagine) e di applicare filtri e ordinamenti a livello di database.
3.  **L'esperienza utente** con le tabelle attuali è estremamente scadente e non adatta a un ambiente di produzione.

## 3. Piano d'Azione

Questo piano è un **prerequisito fondamentale** per il successo della Fase 2 (Analisi e Reportistica) e per l'usabilità generale dell'applicazione.

### Task 4.1: Aggiornamento delle API per Supporto Avanzato
- **Azione:** Modificare tutte le rotte API che restituiscono elenchi di dati.
- **Dettagli:**
    1.  Implementare un pattern di risposta standardizzato che includa i dati e i metadati di paginazione: `{ data: T[], total: number }`.
    2.  Modificare le query Prisma per utilizzare `skip()` e `take()` per la paginazione.
    3.  Aggiungere la logica per gestire parametri di query come `page`, `pageSize`, `search`, `sortBy`, `sortOrder` e filtri specifici per colonna.
- **Priorità:** Iniziare con gli endpoint più critici: `conti`, `registrazioni`, `clienti`, `fornitori`.

### Task 4.2: Sviluppo del Componente `AdvancedDataTable`
- **Azione:** Creare un nuovo componente React riutilizzabile.
- **Dettagli:**
    1.  Creare il file `src/components/ui/advanced-data-table.tsx`.
    2.  Utilizzare `@tanstack/react-table` per gestire la logica della tabella.
    3.  Implementare i controlli UI per la paginazione (pulsanti avanti/indietro, indicatore di pagina).
    4.  Aggiungere una barra di ricerca globale e un sistema per i filtri per colonna.
    5.  Gestire gli stati di caricamento (`skeleton`) e di tabella vuota.
- **Verifica:** Il nuovo componente deve essere generico e configurabile tramite props per poter essere riutilizzato in tutta l'applicazione.

### Task 4.3: Adozione Incrementale del Nuovo Componente
- **Azione:** Sostituire le vecchie tabelle con il nuovo componente.
- **Dettagli:**
    1.  Creare un hook personalizzato `useAdvancedTable` per incapsulare la logica di fetching e gestione dello stato (paginazione, filtri) per ogni tabella.
    2.  Rifattorizzare, una alla volta, le tabelle esistenti partendo dalla più critica:
        - `ContiTable.tsx`
        - `ScrittureTable.tsx` (da creare nella Fase 2)
        - `ClientiTable.tsx`, `FornitoriTable.tsx`, e le altre nel pannello di amministrazione.
- **Verifica:** Ogni tabella aggiornata deve essere performante e offrire un'esperienza utente fluida, anche con un grande numero di record.

### Task 4.4: Eliminazione del Codice Obsoleto
- **Azione:** Rimuovere i componenti e gli hook non più utilizzati.
- **Dettagli:**
    1.  Una volta che tutte le tabelle sono state migrate al nuovo sistema, rimuovere il vecchio componente `DataTable` e gli hook associati (es. `useCrudTable`) se resi obsoleti dalla nuova implementazione.
- **Verifica:** L'applicazione deve funzionare correttamente senza il codice legacy. 