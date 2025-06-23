# Piano Operativo: Importazione e Configurazione Dati Cliente

Questo documento descrive i passaggi necessari per importare, mappare e configurare i dati del cliente all'interno dell'applicazione, basandosi sull'analisi del file `cliente-bilanci_centri_di_costo_ricavo.txt`.

L'obiettivo finale è avere un'istanza dell'applicazione pre-configurata con dati realistici, che permetta di testare il flusso di lavoro completo: `Setup -> Creazione Commessa -> Import Scritture -> Riconciliazione/Allocazione -> Controllo su Dashboard`.

---

## Struttura Dati Target

La struttura gerarchica che vogliamo rappresentare nel nostro sistema è la seguente:
- **Commesse**: I Comuni (es. Sorrento, Massa Lubrense).
- **Centri di Costo**: Le Attività all'interno di un Comune (es. Igiene Urbana - Sorrento, Verde Pubblico - Sorrento). Questi verranno gestiti come `Commessa` con una relazione padre-figlio.
- **Voci Analitiche**: Le macro-categorie di costo/ricavo (es. Costo del personale, Gestione automezzi).
- **Conti**: Il piano dei conti del cliente (es. `6005000850 CARBURANTI E LUBRIFICANTI`), mappato su una `VoceAnalitica`.

---

## Piano di Lavoro Dettagliato

### Task 1: Creazione e Popolamento delle Voci Analitiche

- **Obiettivo**: Popolare la tabella `VoceAnalitica` con le 14 categorie di spesa identificate.
- **Azione**:
    1. Creare un nuovo script di seed in `prisma/seed.ts` (o modificare l'esistente).
    2. Nello script, definire un array contenente le 14 voci analitiche estratte dal file di bilancio.
    3. Usare `prisma.voceAnalitica.createMany()` per inserire questi dati nel database.
    4. Eseguire il seed per popolare il DB.

### Task 2: Modifica Struttura per Gerarchia Commesse (Comuni -> Attività)

- **Obiettivo**: Permettere di creare una gerarchia tra Commesse per rappresentare la relazione `Comune -> Attività`.
- **Azione**:
    1. Modificare `prisma/schema.prisma` aggiungendo al modello `Commessa` una relazione a sé stesso per gestire la gerarchia (es. `parentId`).
    2. Creare e applicare una nuova migrazione del database per rendere effettiva la modifica.
    3. Aggiornare il client Prisma.

### Task 3: Creazione e Popolamento delle Commesse e Centri di Costo

- **Obiettivo**: Popolare la tabella `Commessa` con i Comuni (genitori) e le Attività (figli).
- **Azione**:
    1. Nello script di seed, per prima cosa, creare un `Cliente` generico (es. "PENISOLAVERDE SPA") a cui associare le commesse.
    2. Creare le `Commesse` principali (i Comuni: Sorrento, Piano di Sorrento, Massa Lubrense).
    3. Creare le `Commesse` secondarie (le Attività/Centri di Costo, es. "Igiene Urbana - Sorrento") e collegarle alla commessa genitore corretta tramite il campo `parentId`.
    4. Eseguire il seed.

### Task 4: Importazione delle Scritture di Prima Nota

- **Obiettivo**: Popolare il database con le scritture contabili complete (testata, righe contabili, righe IVA e ripartizioni analitiche per commessa), basandosi sui file di esportazione del cliente.
- **Analisi dei File Sorgente**:
    - **Fonte Dati**: L'importazione si basa su un set di file di testo a tracciato fisso, che rappresentano un'esportazione completa della prima nota del cliente.
    - **File Chiave**:
        - `PNTESTA.TXT`: Contiene le informazioni di testata di ogni registrazione contabile (data, causale, numero documento, totali).
        - `PNRIGCON.TXT`: Contiene le righe contabili (movimenti Dare/Avere sui conti).
        - `PNRIGIVA.TXT`: Contiene i dettagli IVA per le operazioni fiscalmente rilevanti.
        - `MOVANAC.TXT`: File cruciale per l'analisi di commessa. Contiene la ripartizione dei costi e ricavi sui diversi centri di costo/ricavo (che per noi sono le `Commesse`).
    - **Collegamento Dati**: Tutti i file sono collegati da un **Codice Univoco di Scaricamento** (presente in ogni riga dei diversi file) che permette di ricostruire l'intera registrazione contabile, comprese le sue ramificazioni analitiche.
- **Azione**:
    1.  **Sviluppo di un Parser Dedicato**: Creare una nuova rotta server (es. `POST /api/import/prima-nota`) e una funzione di servizio per gestire l'upload e il parsing dei file.
    2.  **Logica di Parsing**:
        - Implementare una funzione in grado di leggere file a larghezza fissa (`fixed-width`), basandosi sui tracciati record forniti nel documento `Import_Export file ascii.txt`.
        - La logica dovrà ciclare su ogni registrazione in `PNTESTA.TXT`.
        - Per ogni testata, usare il codice univoco per trovare e aggregare tutte le righe corrispondenti da `PNRIGCON.TXT`, `PNRIGIVA.TXT` e `MOVANAC.TXT`.
    3.  **Ricostruzione e Salvataggio**:
        - Creare oggetti strutturati in memoria che rappresentino i modelli Prisma (`ScritturaContabile`, `RigaScrittura`, ecc.).
        - Popolare il record `ScritturaContabile` con i dati della testata.
        - Per ogni riga di costo/ricavo, creare un record `RigaScrittura`, collegandolo al `Conto` corretto e alla `VoceAnalitica` associata.
        - Leggere `MOVANAC.TXT` per creare le ripartizioni di costo/ricavo, associando la `RigaScrittura` alla `Commessa` (centro di costo) corretta con il relativo importo.
        - Utilizzare una transazione Prisma (`prisma.$transaction`) per salvare l'intera scrittura contabile (testata, righe, ripartizioni) in modo atomico, garantendo l'integrità dei dati.

### Task 5: Sviluppo Interfaccia di Importazione Prima Nota

- **Obiettivo**: Creare una UI che permetta all'utente di caricare il set di file di prima nota (`PNTESTA`, `PNRIGCON`, etc.) e avviare il processo di importazione definito nel Task 4.
- **Descrizione**: Questo task verrà affrontato una volta consolidata la logica di backend. La UI dovrà fornire feedback all'utente sullo stato dell'importazione (es. in corso, completato, errori riscontrati) e visualizzare un log dei risultati. 