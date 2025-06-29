# Fase 3 - Piano Gestione Flessibile delle Allocazioni

## 1. Analisi dello Stato Attuale della Codebase

Valutiamo come sono gestite attualmente le allocazioni per capire dove intervenire.

### a. Modello Dati (`prisma/schema.prisma`)
*   **Stato Attuale:** Il modello `Allocazione` è il fulcro di questa logica. Attualmente, rappresenta una relazione **diretta e rigida**: una singola `RigaScrittura` è collegata a una singola `Commessa` e a una `VoceAnalitica`. L'importo allocato è, implicitamente, l'intero importo della riga di scrittura.
*   **Valutazione:** Questa struttura è **inadeguata** per supportare ripartizioni o modifiche. Per suddividere un costo, abbiamo bisogno di un modello che possa rappresentare una relazione "uno-a-molti" tra una riga di scrittura e le sue varie allocazioni. Il modello `Allocazione` attuale dovrà essere **completamente ripensato**.

### b. Interfaccia Utente (`src/`)
*   **Stato Attuale:** **Inesistente.** Non c'è alcuna interfaccia utente che permetta all'utente di visualizzare, creare o modificare un'entità `Allocazione`. Le allocazioni vengono create solo implicitamente durante l'importazione dei dati dal file `MOVANAC.TXT`.
*   **Valutazione:** L'intera UI per questa funzionalità deve essere **creata da zero**.

### c. Logica di Business e API (`server/`)
*   **Stato Attuale:** La logica di creazione delle allocazioni è contenuta all'interno della rotta di importazione delle scritture (`server/routes/importScritture.ts`). Non esistono endpoint API dedicati per gestire le allocazioni (CRUD).
*   **Valutazione:** Tutta la logica API per la gestione manuale delle allocazioni deve essere **sviluppata ex-novo**.

## 2. Identificazione delle Lacune Funzionali

1.  **Manca un modello dati** che supporti la ripartizione di un singolo costo/ricavo su più commesse.
2.  **Manca qualsiasi interfaccia utente** per la gestione manuale delle allocazioni.
3.  **Mancano endpoint API dedicati** per le operazioni CRUD sulle allocazioni.

## 3. Piano d'Azione

### Task 3.1: Riprogettazione del Modello Dati `Allocazione`
- **Azione:** Modificare il file `prisma/schema.prisma`.
- **Dettagli:**
    1.  Rinominare (o sostituire) il modello `Allocazione` esistente per evitare ambiguità.
    2.  Il nuovo modello `Allocazione` dovrà contenere almeno:
        - `id`: String @id @default(cuid())
        - `importoAllocato`: Float (l'importo specifico di questa singola allocazione)
        - `rigaScritturaId`: String (foreign key alla riga di costo/ricavo)
        - `rigaScrittura`: RigaScrittura @relation(...)
        - `commessaId`: String (foreign key alla commessa di destinazione)
        - `commessa`: Commessa @relation(...)
        - `voceAnaliticaId`: String (foreign key alla voce analitica)
        - `voceAnalitica`: VoceAnalitica @relation(...)
    3.  Questo nuovo schema permette a una `RigaScrittura` di avere `Allocazione[]`, ovvero un array di molte allocazioni.
- **Verifica:** Eseguire `npx prisma migrate dev` e assicurarsi che la migrazione gestisca correttamente la transizione. Aggiornare la logica di importazione per usare questo nuovo modello.

### Task 3.2: Sviluppare l'Interfaccia di Gestione Allocazioni
- **Azione:** Creare un nuovo componente React per la gestione delle allocazioni.
- **Dettagli:**
    1.  Creare un componente `AllocationsManager.tsx`.
    2.  Questo componente riceverà come input una `RigaScrittura` e mostrerà le sue allocazioni correnti.
    3.  Permetterà all'utente di:
        - Aggiungere una nuova riga di allocazione (selezionando una commessa e inserendo un importo).
        - Modificare l'importo di un'allocazione esistente.
        - Eliminare un'allocazione.
    4.  Il componente dovrà includere una validazione per assicurare che la **somma degli importi allocati non superi l'importo totale della riga di scrittura**.
    5.  Integrare questo componente nella pagina di dettaglio della commessa (`CommessaDettaglio.tsx`), probabilmente tramite una modale che si apre cliccando su un'icona vicino a ogni riga di scrittura.
- **Prerequisito:** Sviluppare gli endpoint API necessari.

### Task 3.3: Creare le API per le Allocazioni
- **Azione:** Creare un nuovo file di rotta `server/routes/allocations.ts`.
- **Dettagli:**
    1.  Sviluppare gli endpoint API necessari per supportare l'interfaccia del Task 3.2:
        - `GET /api/righe-scrittura/:id/allocations`: Recupera tutte le allocazioni per una riga.
        - `POST /api/allocations`: Crea una nuova allocazione.
        - `PUT /api/allocations/:id`: Aggiorna un'allocazione.
        - `DELETE /api/allocations/:id`: Elimina un'allocazione.
    2.  Implementare una logica transazionale robusta, specialmente per le operazioni che modificano più allocazioni contemporaneamente (es. ripartizione).
- **Verifica:** Testare i nuovi endpoint con un client API (es. Postman) per assicurarne il corretto funzionamento prima di integrare il frontend. 