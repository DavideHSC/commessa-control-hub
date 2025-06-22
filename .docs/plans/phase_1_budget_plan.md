# Fase 1 - Piano Gestione Budget di Commessa

## 1. Analisi dello Stato Attuale della Codebase

Prima di definire i task, analizziamo cosa esiste già nel progetto che può essere sfruttato o che deve essere modificato per implementare la gestione del budget.

### a. Modello Dati (`prisma/schema.prisma`)
*   **Stato Attuale:** Il modello `Commessa` attuale contiene un campo `budget: Float`. Questo campo è un valore numerico singolo che rappresenta il budget totale della commessa.
*   **Valutazione:** Questa struttura è **insufficiente** per un budgeting analitico. Un budget dettagliato richiede di specificare *come* quel totale è composto (es. 10.000€ per la manodopera, 5.000€ per i materiali). Memorizzare solo il totale non permette un confronto granulare con i costi consuntivi.

### b. Interfaccia Utente (`src/pages/`, `src/components/`)
*   **Stato Attuale:** Esiste un'interfaccia di gestione per le commesse in `src/components/database/CommesseTable.tsx`. Questa UI permette di creare e modificare una commessa, incluso il campo numerico del budget totale.
*   **Valutazione:** L'infrastruttura di base (tabella, modale di modifica) **esiste ed è riutilizzabile**. Tuttavia, non c'è alcuno spazio o componente per gestire un budget dettagliato a righe.

### c. Logica di Business e API (`server/`)
*   **Stato Attuale:** La logica della dashboard (`server/routes/dashboard.ts`) legge il campo `budget` per i suoi calcoli di riepilogo.
*   **Valutazione:** La logica di calcolo esistente dovrà essere aggiornata per leggere e aggregare le nuove righe di budget, invece di affidarsi a un singolo campo.

## 2. Identificazione delle Lacune Funzionali

1.  **Manca un modello dati** per il budget analitico (`RigaBudget`).
2.  **Manca un'interfaccia utente** per la gestione di queste righe di budget.
3.  **La logica di calcolo** della dashboard è basata su una struttura di budget troppo semplice.

## 3. Piano d'Azione

Per colmare queste lacune, il piano si articola nei seguenti task:

### Task 1.1: Evoluzione del Modello Dati
- **Azione:** Modificare il file `prisma/schema.prisma`.
- **Dettagli:**
    1.  Rimuovere il campo obsoleto `budget: Float` dal modello `Commessa`.
    2.  Creare un nuovo modello `RigaBudget` con i seguenti campi:
        - `id`: String @id @default(cuid())
        - `descrizione`: String
        - `importoPrevisto`: Float
        - `commessaId`: String (foreign key)
        - `commessa`: Commessa @relation(fields: [commessaId], references: [id])
        - `voceAnaliticaId`: String? (foreign key, opzionale per ora)
        - `voceAnalitica`: VoceAnalitica? @relation(fields: [voceAnaliticaId], references: [id])
    3.  Aggiungere la relazione inversa nel modello `Commessa`: `righeBudget: RigaBudget[]`.
- **Verifica:** Eseguire `npx prisma migrate dev` per applicare le modifiche al database.

### Task 1.2: Creazione dell'Interfaccia di Gestione Budget
- **Azione:** Sviluppare un nuovo componente React.
- **Dettagli:**
    1.  Creare un componente `BudgetTable.tsx` in una nuova cartella `src/components/commesse/`.
    2.  Questo componente dovrà mostrare le righe di budget per una data commessa e permettere di aggiungerne, modificarne ed eliminarne.
    3.  Integrare questo componente all'interno della modale di modifica della commessa o, preferibilmente, in una futura pagina di dettaglio commessa.
- **Prerequisito:** Sviluppare gli endpoint API necessari (CRUD per `RigaBudget`).

### Task 1.3: Aggiornamento della Logica di Business
- **Azione:** Modificare la rotta `server/routes/dashboard.ts`.
- **Dettagli:**
    1.  Modificare la query che calcola i dati per la dashboard.
    2.  Il "Budget Totale" di una commessa non sarà più letto da un campo diretto, ma dovrà essere calcolato come `SUM(importoPrevisto)` di tutte le `RigaBudget` associate a quella commessa.
- **Verifica:** Assicurarsi che la dashboard continui a funzionare correttamente, mostrando il nuovo totale del budget calcolato. 