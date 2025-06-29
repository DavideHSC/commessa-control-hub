Perfetto. Avere un contesto così chiaro ("gestione contabile e analitica delle commesse") e uno stack tecnologico definito ci permette di delineare un MVP (Minimum Viable Product) molto mirato e funzionale.

L'obiettivo dell'MVP è creare un nucleo funzionante che dimostri il valore principale dell'applicazione (il controllo di commessa) utilizzando l'infrastruttura dati esistente.

---

### **MVP: Dashboard di Analisi Commesse**

**Concept dell'MVP:** Un'applicazione web che, dopo aver importato e processato i dati dai file di tracciato, offre una dashboard per visualizzare i costi e i ricavi aggregati per ogni "commessa", che nel nostro caso è rappresentata dai **Centri di Costo/Ricavo**.

#### **Componenti Funzionali dell'MVP**

1.  **Backend (Express API):**
    *   **Endpoint di Importazione (`/api/import`):**
        *   Un endpoint `POST` che accetta i file di testo (`PNTESTA.TXT`, `PNRIGCON.TXT`, `MOVANAC.TXT`, ecc.).
        *   **Logica Interna:** Esegue il parsing dei file nell'ordine di dipendenza che abbiamo stabilito.
        *   **Popolamento DB (PostgreSQL):** Inserisce i dati parsati nelle tabelle del database, rispettando le relazioni con chiavi primarie ed esterne.
        *   **Gestione Errori:** Restituisce un report sull'esito dell'importazione (es. "Importate 1000 righe, 5 errori in PNRIGCON.TXT alla riga X"). *Per l'MVP, possiamo limitarci a loggare gli errori senza una UI complessa per la correzione.*

2.  **Database (PostgreSQL):**
    *   **Struttura:** Le tabelle create devono rispecchiare fedelmente lo schema ERD che abbiamo discusso, con `PRIMARY KEY` e `FOREIGN KEY` per applicare l'integrità referenziale a livello di database.
    *   **Vista Materializzata o Tabella di Aggregazione (Consigliato):** Per evitare calcoli complessi ad ogni richiesta, creare una vista materializzata o una tabella `report_commesse` che viene ricalcolata dopo ogni importazione. Questa tabella avrà colonne come:
        *   `centro_di_costo_id`
        *   `descrizione_cdc`
        *   `totale_costi`
        *   `totale_ricavi`
        *   `margine` (totale_ricavi - totale_costi)
        *   `ultimo_aggiornamento`

3.  **Frontend (Next.js):**
    *   **Pagina di Upload (`/upload`):**
        *   Un semplice form per caricare i file di testo da importare.
        *   Mostra un messaggio di successo o fallimento al termine del processo di backend.
    *   **Pagina Dashboard Principale (`/dashboard`):**
        *   Una tabella riassuntiva che mostra l'elenco di tutte le commesse (Centri di Costo).
        *   **Colonne:** Commessa (ID e Descrizione), Totale Costi, Totale Ricavi, Margine Lordo.
        *   I dati vengono recuperati da un endpoint API (es. `/api/commesse`) che legge dalla vista materializzata nel DB.
        *   **Funzionalità di Base:** Ordinamento per colonna (es. per margine decrescente) e un semplice filtro per cercare una commessa per nome o codice.
    *   **Pagina di Dettaglio Commessa (`/dashboard/[idComessa]`):**
        *   Cliccando su una riga della dashboard, si naviga a questa pagina.
        *   Mostra le stesse informazioni di riepilogo in alto (costi, ricavi, margine).
        *   Sotto, presenta due tabelle:
            1.  **Dettaglio Costi:** Elenco di tutte le righe contabili di costo (`PNRIGCON` + `MOVANAC`) attribuite a quella commessa. Colonne: Data, Descrizione Movimento, Conto Contabile, Importo.
            2.  **Dettaglio Ricavi:** Elenco di tutte le righe contabili di ricavo attribuite a quella commessa. Colonne: Data, Descrizione Movimento, Conto Contabile, Importo.

---

### **Focus: Gestione Contabile e Analitica della Commessa (Costi e Ricavi)**

Ecco come il sistema deve funzionare "sotto il cofano" per gestire una commessa.

**Definizione di "Commessa" nel nostro contesto:** Una **commessa** è un'astrazione che raggruppa costi e ricavi. Nel tuo ecosistema dati, l'elemento che svolge questa funzione è il **`CENTRO DI COSTO`** definito nel file `MOVANAC.TXT`. Possiamo considerare ogni "Centro di Costo" come una "Commessa".

#### **1. Tracciamento dei Costi di Commessa**

Il flusso per attribuire un costo a una commessa è il più dettagliato e coinvolge più file:

1.  **Registrazione della Fattura Fornitore:**
    *   Si crea una `TestataMovimento` (da `PNTESTA.TXT`) per la fattura.
    *   Si crea una `RigaContabile` (da `PNRIGCON.TXT`) per il costo (es. conto "Costo per materie prime" in DARE). Questa riga avrà un suo `progressivoRigo`.
    *   Cruciale: Il campo `INS. DATI MOVIMENTI ANALITICI` in questa riga di costo deve essere impostato a `1`.

2.  **Attribuzione alla Commessa:**
    *   Si crea uno o più record in `MovimentoAnalitico` (da `MOVANAC.TXT`).
    *   **Relazione:** Ogni record `MovimentoAnalitico` è legato alla `RigaContabile` del costo tramite la coppia di chiavi `(CodiceUnivoco, ProgressivoRigo)`.
    *   **Dato Chiave:** Il campo `CENTRO DI COSTO` in `MOVANAC.TXT` identifica la commessa a cui attribuire l'importo. Il campo `PARAMETRO` contiene l'importo del costo da allocare.
    *   **Esempio:** Se il costo totale è 1000€, si possono creare due righe in `MOVANAC.TXT`: una che attribuisce 600€ alla commessa "CANTIERE-A" e una che attribuisce 400€ alla commessa "CANTIERE-B".

3.  **Aggregazione per la Dashboard:**
    *   Per calcolare il **Totale Costi** di una commessa (es. "CANTIERE-A"), la query sul database deve fare una `SUM` sul campo `parametro` della tabella `MovimentiAnalitici`, filtrando per `centro_di_costo = 'CANTIERE-A'`.

#### **2. Tracciamento dei Ricavi di Commessa**

Il tracciamento dei ricavi segue una logica simile, ma spesso più diretta.

1.  **Registrazione della Fattura Cliente:**
    *   Si crea una `TestataMovimento` per la fattura di vendita.
    *   Si crea una `RigaContabile` per il ricavo (es. conto "Ricavi da vendite" in AVERE).
    *   Anche qui, il flag `INS. DATI MOVIMENTI ANALITICI` deve essere `1`.

2.  **Attribuzione alla Commessa:**
    *   Si crea un record in `MovimentoAnalitico` che lega la riga di ricavo alla commessa desiderata tramite il campo `CENTRO DI COSTO`.
    *   **Importante:** I tracciati non distinguono tra "Centro di Costo" e "Centro di Ricavo". È una convenzione. Lo stesso campo `CENTRO DI COSTO` viene usato per entrambi. Sarà la natura del conto contabile (Costo o Ricavo) a determinare se l'importo in `parametro` è un costo o un ricavo per la commessa.

3.  **Aggregazione per la Dashboard:**
    *   Per calcolare il **Totale Ricavi** della commessa "CANTIERE-A", la query è simile a quella dei costi: una `SUM` sul `parametro` di `MovimentiAnalitici`, ma questa volta deve essere unita (`JOIN`) con la tabella `RigheContabili` e `PianiDeiConti` per filtrare solo i movimenti legati a conti di tipo **Ricavo**.

#### **Schema Logico Relazionale per la Commessa**

Visualizziamo il flusso dati per una singola commessa:

```
+---------------------+
|    COMMESSA         |  (Concetto astratto, rappresentato da un CENTRO_DI_COSTO)
| (es. "CANTIERE-A")  |
+---------------------+
           |
           | Aggrega
           V
+---------------------+
| MOV_ANALITICI       |
| (da MOVANAC.TXT)    |
|---------------------|
| PK CodiceUnivoco    |
| PK ProgressivoRigo  |
|    CentroDiCosto    | <---- Filtro per la commessa
|    Parametro        | <---- Importo da sommare (costo o ricavo)
+---------------------+
           |
           | Dettaglia una specifica riga
           V
+---------------------+
| RIGHE_CONTABILI     |
| (da PNRIGCON.TXT)   |
|---------------------|
| PK CodiceUnivoco    |
| PK ProgressivoRigo  |
|    Conto (FK)       | <---- Riferimento al Piano dei Conti
|    ImportoDare      |
|    ImportoAvere     |
+---------------------+
           |
           | Appartiene a un...
           V
+---------------------+
| PIANO_CONTI         |
| (da CONTIGEN.TXT)   |
|---------------------|
| PK Codifica         |
|    Descrizione      |
|    Gruppo           | <---- Campo chiave per distinguere COSTO da RICAVO
+---------------------+

```
Per calcolare il **margine di commessa**, il tuo sistema dovrà:
1.  Identificare tutti i record in `MOV_ANALITICI` per un dato `CentroDiCosto`.
2.  Per ogni record, risalire alla `RIGHE_CONTABILI` corrispondente.
3.  Dalla riga contabile, risalire al `PIANO_CONTI` per leggere il campo `Gruppo`.
4.  Se `Gruppo` è 'C' (Costo), sommare il `Parametro` al totale dei costi.
5.  Se `Gruppo` è 'R' (Ricavo), sommare il `Parametro` al totale dei ricavi.
6.  Calcolare il margine facendo `Totale Ricavi - Totale Costi`.

Questo MVP, pur essendo "minimo", toccherà tutti gli aspetti cruciali del tuo ecosistema dati e fornirà un valore tangibile e immediato agli utenti finali.