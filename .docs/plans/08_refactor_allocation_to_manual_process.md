# Piano Strategico: Refactoring della Logica di Allocazione a Processo Manuale

**ID:** `PLAN-08`
**Data:** 03 Luglio 2025
**Obiettivo:** Rimuovere completamente la logica di creazione automatica di commesse e allocazioni durante l'importazione delle scritture contabili, per passare a un modello di allocazione interamente manuale gestito dall'utente tramite l'interfaccia dedicata.

---

### **1. Analisi del Problema**

*   **Problema:** L'attuale workflow di importazione delle scritture contabili (`importScrittureContabiliWorkflow`) interpreta i dati presenti nel file `MOVANAC.TXT` come allocazioni pre-esistenti. Se il file fa riferimento a una commessa non presente nel database, il sistema la crea automaticamente con un nome segnaposto (es. "Commessa importata - 1") per non perdere l'associazione.
*   **Impatto:** Questo comportamento, sebbene sicuro dal punto di vista dell'integrità dei dati, non rispecchia il flusso di lavoro desiderato. L'obiettivo non è replicare un'analitica pre-esistente, ma importare i dati contabili "grezzi" per poi lavorarli all'interno del sistema. La creazione automatica di commesse "sporcano" l'anagrafica e va contro il principio di un inserimento dati controllato.
*   **Causa Radice:** Il `scrittureContabiliTransformer` è stato progettato per essere robusto e non perdere dati, ma questa robustezza è stata interpretata come la necessità di creare dipendenze mancanti. La nuova specifica chiarisce che le informazioni di allocazione presenti nei file di importazione devono essere ignorate.

---

### **2. Principi Guida**

*   **Separazione dei Compiti:** L'importazione ha il solo scopo di caricare i dati contabili (testate e righe). L'allocazione è un compito di business separato, gestito dall'utente.
*   **Controllo dell'Utente:** L'utente deve avere il pieno controllo sulla creazione delle allocazioni. Nessuna allocazione deve essere creata implicitamente dal sistema durante un import.
*   **Anagrafica Pulita:** Le anagrafiche (in particolare quella delle commesse) devono essere popolate solo tramite azioni esplicite dell'utente o importazioni di anagrafiche dedicate, non come effetto collaterale dell'importazione di movimenti.

---

### **3. Piano d'Azione Dettagliato**

L'intervento si focalizzerà esclusivamente sul disabilitare la parte del `transformer` che gestisce la creazione di commesse e allocazioni.

#### **FASE 1: Rimozione della Logica di Creazione Automatica delle Allocazioni**

*   **STATO:** 🟥 **DA ESEGUIRE (Priorità Massima)**
*   **File Coinvolto:** `server/import-engine/transformation/transformers/scrittureContabiliTransformer.ts`
*   **Obiettivo:** Impedire che il transformer crei record di tipo `Allocazione` e, di conseguenza, le commesse segnaposto.

*   **Azione 1.1: Neutralizzare la Creazione delle Allocazioni:**
    *   Individuare la funzione `creaAllocazioni` all'interno del file.
    *   Modificare la funzione in modo che, indipendentemente dall'input, restituisca sempre un array vuoto (`return [];`). Questa è la modifica più semplice, sicura e chirurgica per disabilitare la creazione di allocazioni senza intaccare il resto del flusso.

*   **Azione 1.2: Neutralizzare l'Identificazione delle Commesse Dipendenti:**
    *   Individuare la funzione `identificaEntitaDipendenti`.
    *   All'interno di questa funzione, commentare o rimuovere il ciclo `for...of` che itera sulle `scrittura.allocazioni` e popola il `Set` `entitaNecessarie.commesse`.
    *   Questo impedirà al sistema di identificare le commesse menzionate nel file `MOVANAC.TXT` come dipendenze da creare.
    *   **Effetto a catena:** Non essendo più identificate, le commesse non verranno create dalla funzione `creaEntitaDipendenti`.

*   **Criteri di Successo:**
    *   L'importazione delle scritture contabili si completa con successo.
    *   Nel database, vengono creati i record `ScritturaContabile` e `RigaScrittura`.
    *   La tabella `Allocazione` rimane vuota al termine dell'importazione.
    *   Nessuna nuova commessa con nome "Commessa importata - X" viene creata.

#### **FASE 2: Verifica del Flusso di Lavoro Manuale**

*   **STATO:** 🟥 **DA VERIFICARE DOPO FASE 1**
*   **Componente Coinvolto:** Interfaccia Utente (`/riconciliazione`)

*   **Azione 2.1: Test End-to-End del Flusso Manuale:**
    1.  Eseguire un'importazione di scritture contabili (con un file `MOVANAC.TXT` che contiene riferimenti a commesse).
    2.  Verificare nel database che nessuna allocazione o commessa segnaposto sia stata creata (come da Fase 1).
    3.  Accedere alla pagina `/riconciliazione`.
    4.  Verificare che tutte le righe di costo/ricavo importate appaiano con lo stato "Da Allocare".
    5.  Scegliere una riga, cliccare "Modifica Allocazione", assegnare l'importo a una o più commesse **pre-esistenti** e salvare.
    6.  Verificare che l'operazione vada a buon fine e che lo stato della riga nella tabella si aggiorni a "Allocata" o "Allocazione Parziale".
    7.  Controllare nel database che i record corretti siano stati creati nella tabella `Allocazione`.

*   **Criteri di Successo:**
    *   Il flusso di lavoro manuale è 100% funzionante e permette all'utente di completare le associazioni come previsto.

#### **FASE 3: Pulizia del Codice Legacy (Opzionale)**

*   **STATO:** 🟨 **DA VALUTARE (Bassa Priorità)**
*   **Obiettivo:** Rimuovere il codice relativo alla gestione del file `MOVANAC.TXT`, dato che le sue informazioni vengono ora ignorate.

*   **Azione 3.1: Rimuovere il Parsing del File:**
    *   Nel file `server/import-engine/orchestration/workflows/importScrittureContabiliWorkflow.ts`, rimuovere la logica che legge e fa il parsing di `movAnac` dai `files` in input.
*   **Azione 3.2: Rimuovere le Definizioni:**
    *   Nel file `server/import-engine/acquisition/definitions/scrittureContabiliDefinitions.ts`, rimuovere l'export `movAnacDefinitions`.
*   **Azione 3.3: Rimuovere gli Schemi di Validazione:**
    *   Nel file `server/import-engine/acquisition/validators/scrittureContabiliValidator.ts`, rimuovere `rawMovAnacSchema`, `validatedMovAnacSchema` e i tipi associati.

---

### **4. Riepilogo Esecutivo**

Questo intervento mira a un cambiamento strategico nel flusso di lavoro, allineando l'applicazione al requisito fondamentale di un'allocazione manuale e controllata. Le modifiche tecniche sono mirate e a basso rischio, concentrate sul "disattivare" una funzionalità non desiderata all'interno di un componente di trasformazione ben isolato. Il completamento con successo della Fase 1 è sufficiente a sbloccare il flusso di lavoro desiderato per l'utente. 