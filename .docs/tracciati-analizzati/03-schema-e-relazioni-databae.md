Certamente. Progettare correttamente le relazioni nel database è fondamentale per garantire l'integrità e l'efficienza del sistema.

Basandomi sull'analisi dei tracciati, ecco uno schema logico del database, con le tabelle, i campi chiave per le relazioni e il tipo di relazione (cardinalità).

### Schema Logico delle Relazioni del Database

Di seguito presento lo schema in due formati: una tabella descrittiva e uno schema grafico Entità-Relazione (ERD) per una visualizzazione più immediata.

#### Tabella Descrittiva delle Relazioni

| Tabella "Padre" <br> (Lato "Uno") | Campo Chiave Primaria | Tabella "Figlio" <br> (Lato "Molti") | Campo Chiave Esterna (Foreign Key) | Tipo di Relazione | Descrizione della Dipendenza |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PianiDeiConti** <br> `(da CONTIGEN)` | `Codifica` | **AnagraficheCliFor** <br> `(da A_CLIFOR)` | `SottocontoCliente`, `SottocontoFornitore` | **Uno-a-Molti** | Un conto può essere il sottoconto di molte anagrafiche. |
| **PianiDeiConti** | `Codifica` | **CausaliContabili** <br> `(da CAUSALI)` | `ContoIva`, `ContoIvaVendite` | **Uno-a-Molti** | Un conto può essere usato come conto IVA predefinito in più causali. |
| **PianiDeiConti** | `Codifica` | **RigheContabili** <br> `(da PNRIGCON)` | `Conto` | **Uno-a-Molti** | Un conto viene movimentato in molte righe contabili. |
| **PianiDeiConti** | `Codifica` | **RigheIva** <br> `(da PNRIGIVA)` | `Contropartita` | **Uno-a-Molti** | Un conto può essere la contropartita di molte righe IVA. |
| **CondizioniPagamento** <br> `(da CODPAGAM)` | `CodicePagamento` | **AnagraficheCliFor** | `CodicePagamentoDefault` | **Uno-a-Molti** | Una condizione di pagamento può essere lo standard per molte anagrafiche. |
| **CondizioniPagamento** | `CodicePagamento` | **TestateMovimenti** <br> `(da PNTESTA)` | `CodicePagamento` | **Uno-a-Molti** | Una condizione di pagamento può essere usata in molte testate (override). |
| **CodiciIva** <br> `(da CODICIVA)` | `CodiceIva` | **RigheIva** | `CodiceIva` | **Uno-a-Molti** | Un codice IVA può essere applicato a molte righe IVA. |
| **CausaliContabili** | `CodiceCausale` | **TestateMovimenti** | `CodiceCausale` | **Uno-a-Molti** | Una causale viene utilizzata per registrare molte testate di movimenti. |
| **AnagraficheCliFor** | `(CodiceFiscale, Subcodice)` | **TestateMovimenti** | `(CliFor_CodiceFiscale, CliFor_Subcodice)` | **Uno-a-Molti** | Un'anagrafica può essere associata a molte testate di movimenti. |
| **AnagraficheCliFor** | `(CodiceFiscale, Subcodice)` | **RigheContabili** | `(CliFor_CodiceFiscale, CliFor_Subcodice)` | **Uno-a-Molti** | Un'anagrafica può essere movimentata in molte righe contabili. |
| **TestateMovimenti** | `CodiceUnivoco` | **RigheContabili** | `CodiceUnivoco` | **Uno-a-Molti** | Una testata ha molte righe contabili (partita doppia). |
| **TestateMovimenti** | `CodiceUnivoco` | **RigheIva** | `CodiceUnivoco` | **Uno-a-Molti** | Una testata ha molte righe IVA (castelletto IVA). |
| **TestateMovimenti** | `CodiceUnivoco` | **MovimentiAnalitici** <br> `(da MOVANAC)` | `CodiceUnivoco` | **Uno-a-Molti** | Una testata può avere molti dettagli analitici. |
| **RigheContabili** | `(CodiceUnivoco, ProgressivoRigo)` | **MovimentiAnalitici** | `(CodiceUnivoco, ProgressivoRigo)` | **Uno-a-Molti** | Una riga contabile (es. un costo) può essere suddivisa su più centri di costo. |

---

### Schema Grafico Entità-Relazione (ERD)

Questo diagramma `mermaid` visualizza le relazioni descritte sopra. La notazione `PK` indica una Chiave Primaria e `FK` una Chiave Esterna. Il simbolo `---|{` indica una relazione "uno-a-molti".

```mermaid
erDiagram
    %% Tabelle di configurazione (Master Data)
    COND_PAGAMENTO {
        string CodicePagamento PK "Codice"
        string Descrizione
    }
    
    CODICI_IVA {
        string CodiceIva PK "Codice"
        string Descrizione
        float Aliquota
    }
    
    PIANO_CONTI {
        string Codifica PK "Codice Conto (MM/CC/SS)"
        string Descrizione
        string Tipo
    }
    
    CAUSALI {
        string CodiceCausale PK "Codice"
        string Descrizione
        string ContoIva FK "-> PIANO_CONTI"
    }
    
    %% Anagrafica
    ANAGRAFICHE {
        string CodiceFiscale PK "CF Cliente/Fornitore"
        string Subcodice PK "Subcodice"
        string RagioneSociale
        string CodicePagamento FK "-> COND_PAGAMENTO"
        string SottocontoCliente FK "-> PIANO_CONTI"
        string SottocontoFornitore FK "-> PIANO_CONTI"
    }

    %% Movimenti
    TESTATE_MOV {
        string CodiceUnivoco PK "ID Transazione"
        string DataRegistrazione
        string CodiceCausale FK "-> CAUSALI"
        string CliFor_CodiceFiscale FK "-> ANAGRAFICHE"
        string CliFor_Subcodice FK "-> ANAGRAFICHE"
    }
    
    RIGHE_CONTABILI {
        string CodiceUnivoco PK, FK "-> TESTATE_MOV"
        int ProgressivoRigo PK "Progressivo"
        string Conto FK "-> PIANO_CONTI"
        decimal ImportoDare
        decimal ImportoAvere
    }
    
    RIGHE_IVA {
        string CodiceUnivoco PK, FK "-> TESTATE_MOV"
        int ProgressivoIva PK "Progressivo"
        string CodiceIva FK "-> CODICI_IVA"
        decimal Imponibile
        decimal Imposta
    }
    
    MOV_ANALITICI {
        string CodiceUnivoco PK, FK "-> RIGHE_CONTABILI"
        int ProgressivoRigo PK, FK "-> RIGHE_CONTABILI"
        int ProgressivoAnalitico PK "Progressivo"
        string CentroDiCosto
        decimal Importo
    }
    
    %% Relazioni
    COND_PAGAMENTO ||--|{ ANAGRAFICHE : "ha come default"
    PIANO_CONTI ||--|{ ANAGRAFICHE : "è sottoconto di"
    PIANO_CONTI ||--|{ RIGHE_CONTABILI : "è movimentato da"
    PIANO_CONTI ||--|{ RIGHE_IVA : "è contropartita di"
    CODICI_IVA ||--|{ RIGHE_IVA : "è applicato a"
    CAUSALI ||--|{ TESTATE_MOV : "è usata per"
    ANAGRAFICHE ||--|{ TESTATE_MOV : "è associata a"
    TESTATE_MOV ||--|{ RIGHE_CONTABILI : "è composta da"
    TESTATE_MOV ||--|{ RIGHE_IVA : "dettaglia IVA in"
    RIGHE_CONTABILI ||--|{ MOV_ANALITICI : "è dettagliata da"
```

### Riassunto delle Chiavi e delle Relazioni

1.  **Tabelle di Configurazione (`PIANO_CONTI`, `CODICI_IVA`, `CODPAGAM`, `CAUSALI`):**
    *   Sono le tabelle "master" o di "lookup".
    *   Le loro chiavi primarie (es. `Codifica`, `CodiceIva`, `CodicePagamento`, `CodiceCausale`) vengono usate come chiavi esterne (foreign keys) in quasi tutte le altre tabelle.

2.  **Tabella Anagrafiche (`ANAGRAFICHE`):**
    *   Ha una **chiave primaria composta** (`CodiceFiscale`, `Subcodice`) per identificare univocamente un soggetto.
    *   **Dipende** dalle tabelle di configurazione tramite le chiavi esterne per le condizioni di pagamento e i sottoconti contabili.

3.  **Tabelle dei Movimenti (`TESTATE_MOV`, `RIGHE_CONTABILI`, `RIGHE_IVA`, `MOV_ANALITICI`):**
    *   Formano una **struttura gerarchica**.
    *   **`TESTATE_MOV`** è il "padre" di tutta la transazione, identificato da `CodiceUnivoco`. Dipende da `CAUSALI` e `ANAGRAFICHE`.
    *   **`RIGHE_CONTABILI`** e **`RIGHE_IVA`** sono "figli" di `TESTATE_MOV`, collegate tramite la chiave esterna `CodiceUnivoco`. A loro volta, dipendono da `PIANO_CONTI` e `CODICI_IVA`.
    *   **`MOV_ANALITICI`** è il "figlio" di una `RIGHE_CONTABILI`, collegato tramite una **chiave esterna composta** (`CodiceUnivoco`, `ProgressivoRigo`).

Questo schema garantisce che i dati siano consistenti: non si può registrare un movimento per un fornitore che non esiste, né usare un'aliquota IVA non definita, e così via. È la base per un database contabile robusto e affidabile.