# Piano Operativo: Importazione Scritture con Riconciliazione Interattiva

Questo documento descrive l'evoluzione del processo di importazione delle scritture contabili, passando da un flusso puramente automatico a un **modello ibrido**. Questo nuovo approccio combina la velocità dell'automazione con la flessibilità e il controllo dell'intervento manuale, requisito fondamentale per gestire le casistiche di allocazione complesse (multi-commessa, importi parziali, percentuali).

---

## La Fonte della Verità: i Parser Python

**Regola Assoluta:** I parser Python situati in `.docs/code/` sono la **fonte definitiva della verità** per quanto riguarda il layout dei file, la logica di parsing e le relazioni tra i dati. Qualsiasi implementazione in TypeScript, schema del database (`prisma.schema`) o logica di business deve conformarsi scrupolosamente a quanto definito in questi script. In caso di discrepanza, è il codice TypeScript o lo schema a dover essere corretto, non il contrario.

---

## Principio Guida Fondamentale: Il "Test di Impatto"

**Regola d'Oro:** Prima di scrivere o modificare qualsiasi riga di codice che interagisce con i dati (schema del database, logica di business, API), è obbligatorio eseguire un'analisi di impatto preliminare.

Questo "test mentale" è un passaggio critico per garantire la coerenza e la stabilità del sistema e deve rispondere alle seguenti domande:

1.  **Interazione e Dipendenze:** In che modo la nuova funzionalità o modifica interagisce con le parti esistenti del sistema? Quali anagrafiche (Conti, Commesse, Clienti) sono necessarie? La modifica dipende da altri moduli o processi?
2.  **Integrità dei Dati:** La modifica rispetta i vincoli del database e la logica di business? Può creare dati orfani, incoerenti o duplicati? Come viene garantita la consistenza dei dati durante il processo?
3.  **Flusso Utente:** L'impatto sull'interfaccia utente è chiaro? La modifica semplifica o complica il lavoro dell'utente? Il flusso di lavoro risultante è logico e intuitivo?
4.  **Rischi e Mitigazione:** Quali sono i potenziali rischi (es. fallimento di un'importazione, dati errati, performance)? Quali strategie di mitigazione verranno adottate (es. transazioni, validazione dei dati, logging dettagliato, test specifici)?

**Questo principio non è opzionale.** È la base per costruire un'applicazione robusta, manutenibile e affidabile, evitando regressioni e problemi in produzione.

---

## Piano di Integrazione e Allineamento con i Parser Python

Per garantire la massima precisione e robustezza del sistema, allineeremo la nostra logica di parsing in TypeScript a quella dei parser Python validati. Questo processo sarà la nostra **"Fase 0"**, un prerequisito fondamentale per le fasi successive.

### Fase 0: Allineamento e Validazione dei Parser

L'obiettivo di questa fase è assicurare che il parsing dei file di testo sia **identico** a quello degli script Python, che hanno dimostrato alta precisione.

1.  **Analisi Comparativa dei Layout**:
    -   **Azione**: Confrontare sistematicamente i `LAYOUT` definiti negli script Python (`parser.py`, `parser_a_clifor.py`, ecc.) con le definizioni usate nel nostro backend TypeScript (principalmente in `server/lib/fixedWidthParser.ts` e rotte correlate).
    -   **Obiettivo**: Identificare e documentare ogni discrepanza in termini di posizione iniziale e lunghezza dei campi per ogni file (`PNTESTA`, `PNRIGCON`, `A_CLIFOR`, ecc.).

2.  **Adeguamento del Parser TypeScript**:
    -   **Azione**: Modificare il file `server/lib/fixedWidthParser.ts` e le costanti dei layout per rispecchiare **esattamente** le definizioni dei parser Python. Verrà anche standardizzata la logica di formattazione per date e importi.
    -   **Obiettivo**: Avere un unico, affidabile motore di parsing che sia una traduzione fedele della controparte Python.

3.  **Miglioramento del Seeding del Database**:
    -   **Azione**: Modificare lo script `prisma/seed.ts` per utilizzare i file Excel (`.xlsx`) generati dai parser Python come fonte di dati per il seeding. I file verranno convertiti in CSV o JSON per una facile lettura.
    -   **Obiettivo**: Popolare il database di sviluppo con dati puliti, validati e realistici, migliorando drasticamente la qualità dei test e la coerenza dell'ambiente di sviluppo.

4.  **Implementazione dei Parser Mancanti**:
    -   **Azione**: Sviluppare le rotte e la logica di importazione per le anagrafiche attualmente non gestite nell'applicazione (es. `Causali Contabili`, `Codici IVA`, `Condizioni di Pagamento`), usando gli script Python come "blueprint".
    -   **Obiettivo**: Raggiungere la parità di funzionalità con i parser Python, permettendo l'importazione completa di tutte le anagrafiche di base.

5.  **Test di Validazione Incrociata**:
    -   **Azione**: Eseguire un'importazione tramite l'applicazione e confrontare l'output (i dati inseriti nel DB di staging) con i dati presenti nei file Excel generati da Python.
    -   **Obiettivo**: Confermare con certezza che il risultato del processo di importazione TypeScript è **identico** a quello prodotto dai parser di riferimento.

Questo approccio metodico ridurrà i rischi di errori nei dati, aumenterà l'affidabilità del sistema e ci fornirà una base solida su cui costruire le funzionalità interattive.

---

## Nuovo Flusso di Lavoro Ibrido Proposto

Il processo si evolverà in un flusso di lavoro guidato in tre fasi.

### Fase 1: Importazione e Suggerimento Automatico
L'utente carica i file (`PNTESTA`, `PNRIGCON`, ecc.). Il sistema esegue il parsing e salva i dati in tabelle di staging. In questa fase, il sistema analizza `MOVANAC.TXT` e crea delle **proposte di allocazione**, salvandole in una tabella dedicata.

### Fase 2: Scrivania di Riconciliazione
L'utente viene indirizzato a una nuova interfaccia dedicata. Questa pagina mostra tutte le righe di costo/ricavo importate, evidenziando lo stato di ciascuna:
- **Allocata (Proposta):** Il sistema ha trovato una corrispondenza 1-a-1 e ha generato una proposta.
- **Da Allocare:** La riga è un costo/ricavo ma non ha una proposta automatica.
- **Allocazione Complessa:** Il sistema ha rilevato più righe in `MOVANAC` per la stessa riga contabile.
- **Errore:** Manca un'anagrafica fondamentale (es. il Conto non esiste).

Qui l'utente può:
- **Confermare** le proposte automatiche.
- **Modificare** una proposta errata.
- **Creare** nuove allocazioni da zero attraverso un'interfaccia dedicata, permettendo di suddividere l'importo di una singola riga contabile su **più commesse**, per **importo** o per **percentuale**.

### Fase 3: Consolidamento Finale
Una volta che l'utente è soddisfatto delle allocazioni, avvia il consolidamento. Il sistema legge i dati dallo staging, applica le allocazioni (sia quelle automatiche confermate che quelle manuali) e popola le tabelle di produzione finali (`ScritturaContabile`, `RigaScrittura`, `Allocazione`), garantendo l'integrità referenziale.

---

## Piano di Implementazione Tecnico

1.  **Modifiche al Database (`prisma/schema.prisma`)**
    -   Creare un nuovo modello `ImportAllocazione` con i seguenti campi:
        -   `id`: String @id
        -   `importScritturaRigaContabileId`: Relazione con `ImportScritturaRigaContabile`.
        -   `commessaId`: L'ID della commessa a cui allocare.
        -   `importo`: Float
        -   `percentuale`: Float?
        -   `suggerimentoAutomatico`: Boolean (per distinguere le proposte del sistema dalle modifiche manuali).
    -   Rimuovere i campi `centroDiCosto` e `importoAnalitico` da `ImportScritturaRigaContabile`.
    -   Aggiungere una relazione uno-a-molti da `ImportScritturaRigaContabile` a `ImportAllocazione`.

2.  **Sviluppo del Backend (`server/`)**
    -   **Logica di Importazione (Staging):** Modificare la rotta `POST /api/import/scritture` per popolare i modelli di staging, inclusa la nuova tabella `ImportAllocazione` con i suggerimenti da `MOVANAC.TXT`.
    -   **Nuove API per la Riconciliazione:**
        -   `GET /api/staging/rows`: Fornisce i dati per la Scrivania di Riconciliazione.
        -   `POST /api/staging/allocations`: API per creare, modificare ed eliminare record in `ImportAllocazione`, usata dall'interfaccia di allocazione manuale.
    -   **Logica di Consolidamento:** Riscrivere l'endpoint `POST /api/consolidate-scritture`. Ora dovrà leggere le allocazioni dalla tabella `ImportAllocazione` per creare i record finali.

3.  **Sviluppo del Frontend (`src/`)**
    -   **Nuova Pagina:** Creare la pagina `Riconciliazione.tsx` e la relativa rotta.
    -   **Tabella di Riconciliazione:** Componente React che mostra le righe da allocare, con stati e azioni.
    -   **Modale di Allocazione:** Un componente popup riutilizzabile che permette all'utente di gestire le allocazioni multiple per una singola riga di costo/ricavo, con validazione in tempo reale (es. la somma non deve superare il 100% o l'importo totale).
    -   **Integrazione API:** Collegare i componenti del frontend alle nuove API del backend.

Questo piano trasforma l'importazione in un processo interattivo, potente e a prova di errore, mettendo l'utente al centro del controllo dei dati. 

---

## Fase 4: Da "Scarno" a "Operativo" - Gestione Avanzata Commesse

Dopo aver consolidato il processo di importazione, questa fase si concentra sul rendere il modulo "Commesse" il cuore pulsante dell'applicazione, trasformandolo da una semplice vista a uno strumento di gestione e analisi completo, in linea con le reali necessità operative.

### Task 1: Visualizzazione Dati Operativi (Risoluzione Bug Attuale)

**Obiettivo:** Risolvere il problema corrente per cui le attività (costi/ricavi allocati) non sono visibili, fornendo una visione chiara dei dati consolidati.

1.  **Modifica Backend (`server/routes/commesse.ts`):**
    -   **Azione:** Arricchire la query `prisma.commessa.findMany`. Verrà aggiunto un `include` per caricare non solo i dati base della commessa, ma anche tutte le **allocazioni** collegate, con i dettagli delle righe di scrittura e dei conti associati. Questo garantirà che l'API fornisca al frontend tutti i dati necessari.

2.  **Modifica Frontend (`src/pages/Commesse.tsx`):**
    -   **Azione:** Riscrivere la logica di visualizzazione del componente. Invece di cercare "commesse figlie" (un presupposto errato), il componente visualizzerà direttamente l'elenco delle **allocazioni** (costi e ricavi) per ciascuna commessa. Verrà data evidenza alla descrizione del conto e all'importo.
    -   **Risultato Atteso:** Le commesse nell'interfaccia mostreranno finalmente le attività economiche associate, risolvendo il bug e fornendo un feedback visivo immediato.

### Task 2: Implementazione Gestione Attiva Commesse

**Obiettivo:** Fornire all'utente gli strumenti per creare, modificare e analizzare le commesse direttamente dall'interfaccia, abilitando la struttura gerarchica "Comune -> Attività".

1.  **Sviluppo Form Creazione/Modifica Commessa:**
    -   **Azione:** Creare una nuova pagina o un componente modale dedicato alla gestione delle commesse. Questo permetterà di:
        -   Creare una nuova commessa.
        -   Definire se una commessa è "principale" (un contratto/comune) o "operativa" (un'attività), selezionando la commessa padre da un elenco.
        -   Modificare i dati di una commessa esistente.
    -   **API Necessarie:** Sviluppare gli endpoint `POST /api/commesse` e `PUT /api/commesse/:id` per supportare queste operazioni.

2.  **Sviluppo Dashboard di Dettaglio Commessa:**
    -   **Azione:** Trasformare la pagina di dettaglio, attualmente vuota, in una dashboard completa. Quando un utente clicca su "Dettagli", visualizzerà:
        -   **KPI Aggregati:** Totale costi, totale ricavi e margine operativo.
        -   **Analisi Grafica:** Grafici a torta per la ripartizione dei costi per voce analitica e grafici a barre per l'andamento temporale.
        -   **Dati di Dettaglio:** Una tabella interattiva con tutte le scritture contabili allocate a quella commessa, con funzionalità di ricerca, filtro e ordinamento.
    -   **API Necessarie:** Creare un nuovo endpoint `GET /api/commesse/:id` che restituisca sia i dati aggregati che quelli di dettaglio per una singola commessa. 