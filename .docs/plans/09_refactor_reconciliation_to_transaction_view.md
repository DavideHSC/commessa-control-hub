# Piano Strategico: Refactoring della Scrivania di Riconciliazione da Vista per Riga a Vista per Movimento

**ID:** `PLAN-09`
**Data:** 03 Luglio 2025
**Obiettivo:** Riprogettare la Scrivania di Riconciliazione per operare a livello di movimento contabile (`ScritturaContabile`) anziché di singola riga. L'utente deve poter visualizzare l'intera scrittura (testata e righe) per effettuare un'allocazione manuale contestualizzata e corretta.

---

### **1. Analisi del Problema**

*   **Problema:** L'attuale implementazione della Scrivania di Riconciliazione, sebbene funzionale, presenta i dati come una lista piatta di singole righe di costo/ricavo. Questo approccio decontestualizza la riga dal suo movimento contabile di appartenenza (la scrittura in partita doppia), rendendo il processo di allocazione poco intuitivo e non conforme alle pratiche contabili standard.
*   **Impatto:** L'utente non ha una visione d'insieme del movimento (es. non vede la contropartita di un costo) e deve allocare ogni riga come se fosse un'entità a sé stante.
*   **Requisito:** Il sistema deve presentare una lista di movimenti contabili. L'utente deve poter selezionare un movimento, visualizzarne tutti i dettagli (testata e tutte le righe) e quindi procedere all'allocazione degli importi di costo/ricavo pertinenti su una o più commesse.

---

### **2. Principi Guida**

*   **Contesto Contabile:** L'interfaccia deve sempre presentare i dati rispecchiando la loro natura contabile. Un movimento è un'entità atomica composta da una testata e da righe in partita doppia.
*   **Usabilità e Chiarezza:** Il flusso di lavoro deve essere intuitivo. L'utente deve avere a disposizione tutte le informazioni dell'intero movimento per poter prendere decisioni di allocazione corrette e informate.
*   **Minimo Impatto Laterale:** L'intervento deve essere chirurgico, limitato alla rotta API della riconciliazione e ai componenti React della pagina dedicata, senza modificare la logica di importazione o altre sezioni dell'applicazione.

---

### **3. Piano d'Azione Dettagliato**

#### **FASE 1: Modifica Struttura Dati API (Backend)**

*   **Obiettivo:** Trasformare l'endpoint `/api/reconciliation/staging-rows` affinché restituisca una lista di `ScritturaContabile` complete, anziché una lista di `RigaScrittura`.
*   **File Coinvolto:** `server/routes/reconciliation.ts`.
*   **Azione Dettagliata:**
    1.  La query Prisma principale diventerà `prisma.scritturaContabile.findMany(...)`.
    2.  Si implementerà un filtro nella clausola `where` per selezionare solo le scritture che contengono (`some`) `righe` il cui `conto` associato ha un codice che inizia con '6' (costi) o '7' (ricavi).
    3.  Nella clausola `include`, verranno caricate tutte le relazioni necessarie per ogni scrittura:
        *   `righe`: per ottenere tutte le righe del movimento. All'interno di questo `include`, andrà incluso anche il `conto` (`righe: { include: { conto: true } }`).
        *   Per calcolare lo stato di allocazione, dovremo includere anche le allocazioni per ogni riga: `righe: { include: { conto: true, allocazioni: { include: { commessa: true } } } }`.
    4.  Il corpo della funzione mapperà questi risultati nel nuovo formato atteso dal frontend, calcolando per ogni scrittura un importo totale, il totale già allocato e uno stato di allocazione complessivo.
*   **Precauzioni e Analisi di Impatto:**
    *   **Breaking Change del Contratto API:** Questa modifica romperà il contratto con il frontend attuale. La pagina di riconciliazione non funzionerà più finché non verrà aggiornata nella Fase 2. Questo è un passo necessario e previsto dal piano.
    *   **Performance della Query:** La nuova query è più complessa. Sebbene l'uso di `some` sia performante, il caricamento di relazioni annidate (`include` multipli) su un grande volume di dati potrebbe rallentare la risposta. Per la fase iniziale questo è accettabile. Se emergessero problemi, si potrà implementare una paginazione.
    *   **Isolamento:** La modifica è confinata a questo singolo endpoint. Nessun altro servizio o workflow viene impattato. L'API di salvataggio delle allocazioni (`POST /allocations/:rowId`) non viene toccata in questa fase.

#### **FASE 2: Riprogettazione Interfaccia Utente (Frontend)**

*   **Obiettivo:** Adattare la pagina di riconciliazione per visualizzare i movimenti e permettere all'utente di espanderli per vederne i dettagli.
*   **File Coinvolto:** `src/pages/Riconciliazione.tsx`.
*   **Azione Dettagliata:**
    1.  **Aggiornamento dei Tipi:** I tipi locali (es. `ReconciliationRow`) verranno aggiornati o sostituiti per rispecchiare la nuova struttura dati (una `ScritturaContabile` con un array di `righe`).
    2.  **Riprogettazione `DataTable`:**
        *   La tabella principale mostrerà una riga per ogni `ScritturaContabile`, con colonne relative alla testata (es. Data, Descrizione Scrittura, Importo Totale, Stato).
        *   Verrà aggiunta una colonna per l'azione di "espansione", probabilmente con un'icona a forma di freccia.
    3.  **Implementazione Dettaglio Espandibile:**
        *   Sfruttando le capacità della libreria della tabella (es. `subComponent` in `react-table` o `Collapsible` di `shadcn/ui`), al click sull'icona di espansione verrà renderizzato un componente figlio.
        *   Questo sotto-componente visualizzerà una tabella con l'elenco dettagliato di tutte le `righe` che compongono il movimento selezionato.
*   **Precauzioni e Analisi di Impatto:**
    *   **Dipendenze UI:** Verificare se i componenti UI necessari per creare una riga espandibile sono già disponibili nel progetto (`Collapsible` è un'ottima scelta).
    *   **Gestione dello Stato:** Sarà necessario gestire lo stato di "apertura/chiusura" per ogni riga della tabella principale a livello di stato del componente React.
    *   **Isolamento:** La modifica è quasi interamente contenuta nel file `Riconciliazione.tsx` e nei tipi ad esso associati, senza impattare altre pagine.

#### **FASE 3: Adeguamento del Dialogo di Allocazione**

*   **Obiettivo:** Modificare il dialogo modale per presentare l'intero movimento e gestire l'allocazione delle sue righe di costo/ricavo.
*   **File Coinvolto:** `src/pages/Riconciliazione.tsx` (il componente `AllocationDialog`).
*   **Azione Dettagliata:**
    1.  **Props del Dialogo:** Il dialogo riceverà come prop l'intero oggetto `ScritturaContabile` selezionato.
    2.  **Layout del Dialogo:** La parte superiore del dialogo mostrerà i dati salienti della testata (Data, Descrizione, etc.). Sotto, verrà visualizzato un riepilogo delle righe di costo/ricavo da allocare. La logica di input per l'allocazione rimarrà concettualmente simile.
    3.  **Logica di Salvataggio:** Il punto più critico. L'endpoint di salvataggio attuale (`POST /allocations/:rowId`) lavora su una singola riga. Per mantenere l'intervento focalizzato, si adotterà la seguente strategia:
        *   Quando l'utente clicca "Salva", il frontend costruirà un array di richieste di salvataggio, una per ogni riga di costo/ricavo che è stata allocata.
        *   Queste richieste verranno eseguite in parallelo utilizzando `Promise.all()`.
*   **Precauzioni e Analisi di Impatto:**
    *   **Complessità UI/UX:** Il dialogo deve essere estremamente chiaro nel mostrare quali importi si stanno allocando e come.
    *   **Gestione degli Errori di Salvataggio:** Con `Promise.all`, se anche una sola delle richieste di salvataggio fallisce, l'intero gruppo di promesse verrà rigettato. Il codice dovrà gestire questo caso, informando l'utente dell'errore e invalidando i dati della tabella per forzare un refresh dallo stato reale del database.
    *   **Atomicità:** Questo approccio non garantisce l'atomicità transazionale del salvataggio (una riga potrebbe essere salvata e un'altra no). Data la natura del processo (un utente che esegue un'azione manuale), questo rischio è considerato accettabile per la V1 di questa feature. Un refactoring futuro potrebbe introdurre un endpoint di salvataggio batch per garantire l'atomicità.

---
### **4. Riepilogo Esecutivo**

Questo piano delinea un refactoring significativo ma necessario per allineare la funzionalità di riconciliazione ai requisiti di business e a un corretto flusso di lavoro contabile. Le fasi sono state definite per isolare gli interventi (backend, frontend, dialogo), minimizzando i rischi e permettendo una validazione incrementale. Particolare attenzione è stata posta sull'analisi di impatto e sulle precauzioni da adottare in ogni fase. 