# Piano di Test Funzionale: Gestione Commesse

Questo documento descrive i percorsi di test per validare le funzionalità implementate e refattorizzate nell'applicazione, con un focus sul flusso di gestione delle commesse.

**Obiettivo:** Verificare la robustezza, la coerenza della UI/UX e la correttezza operativa delle nuove implementazioni.

---

## Prerequisiti Generali

- L'applicazione deve essere in esecuzione (`npm run dev`).
- Il database deve essere stato resettato all'ultimo stato delle migrazioni per garantire un ambiente di test pulito.

---

## FASE 1: Test della Creazione della Commessa

**Obiettivo:** Assicurarsi che il processo di creazione di una commessa sia robusto, guidato e funzionante.

### Scenario A: Sistema non inizializzato (Mancanza di dati)

**Test Case 1.1**
- **Funzionalità:** Guardia di Accesso alla Creazione Commessa
- **Scenario:** Un utente tenta di creare una nuova commessa senza aver prima importato i dati necessari (Clienti, Voci Analitiche).
- **Steps:**
    1.  Navigare alla pagina **Commesse** tramite la sidebar.
    2.  Cliccare sul pulsante **"Aggiungi Commessa"**.
- **Risultato Atteso:**
    -   La pagina `Nuova Commessa` viene caricata.
    -   Invece del form, viene visualizzato un messaggio di stato che informa l'utente della necessità di importare Clienti e Voci Analitiche per procedere.
    -   Il messaggio contiene un pulsante o link **"Vai all'Importazione"** che reindirizza alla pagina `/import`.

### Scenario B: Sistema inizializzato (Dati presenti)

**Test Case 1.2**
- **Funzionalità:** Importazione Dati
- **Scenario:** L'utente carica i dati necessari per abilitare la creazione di commesse.
- **Steps:**
    1.  Navigare alla pagina **Import** tramite la sidebar (o dal link nel Test Case 1.1).
    2.  Utilizzare la funzionalità di import per caricare un file CSV/XLSX contenente almeno:
        -   Un cliente.
        -   Una voce analitica.
- **Risultato Atteso:**
    -   Il sistema conferma l'avvenuta importazione.
    -   Navigando nelle rispettive sezioni del **Database**, i dati importati sono visibili e corretti.

**Test Case 1.3**
- **Funzionalità:** Creazione di una Nuova Commessa
- **Scenario:** Con i dati presenti, l'utente crea una nuova commessa completa di budget.
- **Steps:**
    1.  Navigare alla pagina **Commesse**.
    2.  Cliccare su **"Aggiungi Commessa"**.
    3.  **Verificare** che questa volta venga visualizzato il form di creazione.
    4.  Compilare tutti i campi del form:
        -   Selezionare un cliente.
        -   Inserire un nome per la commessa.
        -   Definire le date di inizio e fine.
    5.  Aggiungere almeno due righe di budget, specificando una voce analitica e un importo per ciascuna.
    6.  Cliccare sul pulsante **"Salva Commessa"**.
- **Risultato Atteso:**
    -   La commessa viene salvata con successo.
    -   L'utente viene reindirizzato alla pagina dell'elenco **Commesse**.
    -   La nuova commessa appare nella tabella con i dati riepilogativi corretti.

---

## FASE 2: Test del Centro di Riconciliazione

**Obiettivo:** Verificare che il nuovo hub per l'allocazione delle scritture funzioni come previsto.

**Prerequisito:** Aver importato delle scritture contabili (es. da un file di primanota) che non siano ancora state associate a nessuna commessa.

**Test Case 2.1**
- **Funzionalità:** Visualizzazione Scritture da Riconciliare
- **Scenario:** L'utente accede alla pagina di Riconciliazione per visualizzare i costi e ricavi da allocare.
- **Steps:**
    1.  Navigare alla pagina **Riconciliazione** tramite la sidebar.
- **Risultato Atteso:**
    -   Viene visualizzata una tabella contenente solo ed esclusivamente le righe di scrittura che non hanno una commessa associata.
    -   La tabella mostra colonne pertinenti come Data, Conto, Descrizione, Importo.
    -   In ogni riga è presente un pulsante o un'icona per avviare l'azione di "Allocazione".

**Test Case 2.2**
- **Funzionalità:** UI/UX dell'Allocazione Scrittura
- **Scenario:** L'utente apre l'interfaccia per allocare una scrittura.
- **Steps:**
    1.  Dalla tabella del Test Case 2.1, cliccare sul pulsante **"Alloca"** (o l'icona corrispondente) su una riga a scelta.
- **Risultato Atteso:**
    -   Si apre una modale (o una sezione espandibile).
    -   La modale mostra i dettagli della scrittura selezionata.
    -   Sono presenti due campi principali:
        -   Un combobox/select per scegliere la **Commessa** di destinazione (deve mostrare le commesse create nella Fase 1).
        -   Un combobox/select per scegliere la **Voce Analitica** di destinazione.
    -   È presente un pulsante "Salva" o "Conferma Allocazione".
    -   **Nota:** La logica di salvataggio finale non è ancora implementata. Il test si concentra sulla corretta apertura e popolamento dell'interfaccia.

---

## FASE 3: Test del Cruscotto di Commessa

**Obiettivo:** Validare la pagina di dettaglio e analisi di una singola commessa.

**Prerequisito:** Aver creato almeno una commessa (Test Case 1.3) e, idealmente, averle allocato almeno una scrittura.

**Test Case 3.1**
- **Funzionalità:** Accesso e Visualizzazione Dati Dashboard
- **Scenario:** L'utente analizza i dati di una commessa specifica.
- **Steps:**
    1.  Navigare alla pagina **Commesse**.
    2.  Dalla tabella, cliccare sull'icona "visualizza" o sul nome di una commessa creata in precedenza.
- **Risultato Atteso:**
    -   L'utente viene reindirizzato alla pagina di dettaglio della commessa (`/commesse/:id`).
    -   La pagina mostra chiaramente il nome della commessa.
    -   Vengono visualizzati i **KPI principali**:
        -   Budget Totale
        -   Consuntivo Totale
        -   Scostamento
    -   Viene visualizzato un **Grafico a Barre** che confronta Budget e Consuntivo per ogni Voce Analitica.
    -   Viene visualizzata una **Tabella di Dettaglio** che mostra, per ogni Voce Analitica, i valori di Budget, Consuntivo e Scostamento.
    -   Tutti i dati visualizzati sono coerenti con i dati di budget inseriti e le scritture allocate. 