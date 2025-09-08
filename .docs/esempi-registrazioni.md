Analizzare questi file è come fare un'indagine. Ogni riga di testata (`PNTESTA`) è un "caso" e le righe di dettaglio (`PNRIGCON`) sono gli "indizi".

Basandomi sui file che hai fornito, ho selezionato alcuni esempi "diversi" per mostrarti l'intero processo di interpretazione, assegnazione e visualizzazione nella gestione di commessa.

---

### Prospetto di Analisi e Assegnazione a Commessa

Ecco un'analisi campione per diverse tipologie di movimento.

---

### CASO 1: Fattura da Ricevere - Costo Stimato di Competenza

*   **Identificativo Testata:** `012025110015`
*   **Causale:** `FTDR` - Fatture da ricevere

#### 1. Rappresentazione Visiva del Movimento Contabile

Questa è la scrittura contabile di assestamento così come appare in contabilità generale. È una scrittura "pura", senza IVA.

| Conto | Descrizione (Ipotizzata) | Dare (€) | Avere (€) | Note Originali |
| :--- | :--- | :--- | :--- | :--- |
| `6015002102` | Costi per Servizi (Sottoconto Analitico) | 31,00 | | F RIC 13 del 31/12/2024 VENANZPIERPA |
| `4610000250` | Fornitori c/Fatture da Ricevere | | 31,00 | F RIC 13 del 31/12/2024 VENANZPIERPA |
| **Totale** | | **31,00** | **31,00** | |

#### 2. Rappresentazione Visiva in Fase di Assegnazione

Qui avviene la "magia": l'operatore (o un automatismo) deve decidere a quale commessa associare il costo. L'interfaccia di assegnazione potrebbe assomigliare a questa:

| Riga Costo | Importo da Assegnare (€) | **Commessa di Destinazione** | Voce di Costo Analitico | Indizi / Note per Assegnazione |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 31,00 | **[SCELTA MANUALE]** Es: `COM-24-08` | Pulizie di Cantiere | **Indizi:** Sottoconto `...2102` (analitico), Note `...VENANZPIERPA`. Il responsabile della `COM-24-08` ha comunicato un costo da questo fornitore. |

#### 3. Rappresentazione Visiva nella Commessa (una volta assegnato)

**Vista A: Riepilogo di Commessa (Sintetica)**
Questo movimento aggiorna il totale dei costi previsti ma non ancora fatturati.

| Commessa: `COM-24-08` | Budget (€) | Consuntivo (€) |
| :--- | :--- | :--- |
| Ricavi | 50.000 | 25.000 |
| Costi Effettivi (da FTRI) | 30.000 | 12.000 |
| **Costi Stimati (da FTDR)** | 5.000 | **31,00** |
| **Margine Operativo** | **15.000** | **12.969,00** |

**Vista B: Dettaglio Costi di Commessa (Analitica)**
La riga appare chiaramente identificata come un costo di competenza, non ancora un costo finale.

| Data | Tipo Costo | Fornitore / Note | Voce di Costo | Importo (€) |
| :--- | :--- | :--- | :--- | :--- |
| ... | ... | ... | ... | ... |
| 02.01.25 | **Costo di Competenza (da FTDR)** | VENANZPIERPA (Rif. F RIC 13) | Pulizie di Cantiere | 31,00 |
| ... | ... | ... | ... | ... |

---

### CASO 2: Fattura Ricevuta - Costo Effettivo e Multi-riga

*   **Identificativo Testata:** `012025110005`
*   **Causale:** `FRS` - Fattura ricevuta split payment

#### 1. Rappresentazione Visiva del Movimento Contabile

Questa è una fattura reale, con più voci di costo e l'IVA.

| Conto | Descrizione (Ipotizzata) | Dare (€) | Avere (€) | Note Originali |
| :--- | :--- | :--- | :--- | :--- |
| `6015000751` | Costi per Lavorazioni (Sottoconto) | 216,97 | | |
| `6005000150` | Acquisto Materiali (Sottoconto) | 342,25 | | |
| `1880000300` | IVA su Acquisti | 123,02 | | |
| `2010000365` | Fornitore O BERSAGLIERE | | 682,24 | |
| **Totale** | | **682,24** | **682,24** | |

#### 2. Rappresentazione Visiva in Fase di Assegnazione

Qui bisogna assegnare ogni singola riga di costo.

| Riga Costo | Importo da Assegnare (€) | **Commessa di Destinazione** | Voce di Costo Analitico | Indizi / Note per Assegnazione |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 216,97 | **[SCELTA MANUALE]** Es: `COM-24-08` | Lavorazioni Esterne | **Indizio:** Sottoconto `...0751`. Fattura da "O BERSAGLIERE" (come da testata `PNTESTA`). |
| 2 | 342,25 | **[SCELTA MANUALE]** Es: `COM-24-08` | Materiale di Consumo | **Indizio:** Sottoconto `...0150`. Stessa fattura, costo di natura diversa. |
| 3 | 123,02 | **NON ASSEGNARE** | (N/A) | **Regola:** I costi IVA non si imputano mai alla commessa. |

#### 3. Rappresentazione Visiva nella Commessa (una volta assegnato)

**Vista A: Riepilogo di Commessa (Sintetica)**
Questo movimento aggiorna il totale dei costi effettivi.

| Commessa: `COM-24-08` | Budget (€) | Consuntivo (€) |
| :--- | :--- | :--- |
| Ricavi | 50.000 | 25.000 |
| **Costi Effettivi (da FTRI/FRS)** | 30.000 | **12.559,22** |
| Costi Stimati (da FTDR) | 5.000 | 31,00 |
| **Margine Operativo** | **15.000** | **12.410,78** |

**Vista B: Dettaglio Costi di Commessa (Analitica)**
Appaiono due righe distinte per lo stesso fornitore, permettendo un'analisi dettagliata.

| Data | Tipo Costo | Fornitore / Note | Voce di Costo | Importo (€) |
| :--- | :--- | :--- | :--- | :--- |
| ... | ... | ... | ... | ... |
| 02.01.25 | **Costo Effettivo (da FRS)** | O BERSAGLIERE (Fatt. 1904/A) | Lavorazioni Esterne | 216,97 |
| 02.01.25 | **Costo Effettivo (da FRS)** | O BERSAGLIERE (Fatt. 1904/A) | Materiale di Consumo | 342,25 |
| ... | ... | ... | ... | ... |

---

### CASO 3: Risconti Attivi - Costo da Ripartire nel Tempo

*   **Identificativo Testata:** `012025110087`
*   **Causale:** `RISA` - Risconti attivi

#### 1. Rappresentazione Visiva del Movimento Contabile

Questa scrittura rileva un costo la cui competenza si estende su più periodi.

| Conto | Descrizione (Ipotizzata) | Dare (€) | Avere (€) | Note Originali |
| :--- | :--- | :--- | :--- | :--- |
| `6020001470` | Canoni di Leasing | | 1.259,02 | F RIC 2/001 del 15/01/24 A.R.I.P.S IN |
| `2520000350` | Risconti Attivi | 1.259,02 | | F RIC 2/001 del 15/01/24 A.R.I.P.S IN |
| **Totale** | | **1.259,02** | **1.259,02** | |

#### 2. Rappresentazione Visiva in Fase di Assegnazione

Qui si assegna il costo totale e si specificano i criteri per la ripartizione.

| Riga Costo | Importo da Assegnare (€) | **Commessa di Destinazione** | Voce di Costo Analitico | **Criteri di Ripartizione** |
| :--- | :--- | :--- | :--- | :--- |
| 2 | 1.259,02 | **[SCELTA MANUALE]** Es: `COM-23-01` | Canoni Leasing Mezzi | **Date Competenza:** 01.01.2025 - 24.01.2025 (come da campi `DATA INIZIO/FINE COMPETENZA` nel tracciato `PNRIGCON`). |

#### 3. Rappresentazione Visiva nella Commessa (una volta assegnato)

**Vista A: Riepilogo di Commessa (Sintetica)**
Il risconto non aumenta i costi totali, ma ne modifica la distribuzione temporale. Un buon sistema mostrerebbe il costo di competenza del mese.

**Vista B: Dettaglio Costi di Commessa (Analitica)**
Il sistema di gestione commesse calcola e imputa solo la quota di competenza del periodo.

| Data | Tipo Costo | Fornitore / Note | Voce di Costo | **Importo di Competenza (€)** |
| :--- | :--- | :--- | :--- | :--- |
| ... | ... | ... | ... | ... |
| 31.01.25 | **Quota Risconto Attivo** | A.R.I.P.S IN (Leasing) | Canoni Leasing Mezzi | **52,46** (calcolato come `1259,02 / 24 giorni * 1 giorno di competenza di Gennaio`) |
| ... | ... | ... | ... | ... |

-----------------------------------
-----------------------------------


### Risposta alla Domanda 1: Sono solo queste le Tipologie di Movimento?

No, quelle che abbiamo analizzato erano solo un campione. Esaminando il file `PNTESTA.TXT` che hai fornito, ho identificato le seguenti tipologie di movimenti (basate sul campo `CODICE CAUSALE`):

*   **Fatture di Acquisto:**
    *   `FTRI`: Fattura Ricevuta (standard).
    *   `FRS`: Fattura Ricevuta in regime di Split Payment.
    *   `FTDR`: Fatture da Ricevere (scrittura di assestamento per costi di competenza).
*   **Fatture di Vendita:**
    *   `FTEM`: Fattura Emessa (standard).
    *   `FTS`: Fattura Emessa in regime di Split Payment.
    *   `FTDE`: Fatture da Emettere (scrittura di assestamento per ricavi di competenza).
    *   `FTE0`: Fattura Emessa a Importo Zero.
*   **Note di Credito:**
    *   `NCRSP`: Nota di Credito Ricevuta in Split Payment.
    *   `NCEM`: Nota di Credito Emessa.
*   **Movimenti Finanziari e di Cassa:**
    *   `PAGA`: Pagamento.
    *   `INC`: Incasso.
    *   `38`: Addebito (tipicamente bancario).
*   **Scritture di Assestamento e Chiusura:**
    *   `RISA`: Risconti Attivi (costi pagati in anticipo la cui competenza è su più esercizi).
    *   `RATP`: Ratei Passivi (costi di competenza non ancora pagati e senza documento).
    *   `RIMI`: Rimanenze Iniziali.
    *   `STIP`: Stipendi (registrazione del costo del personale).
*   **Scritture Contabili Generiche:**
    *   `GIRO`: Giroconto (storno, trasferimento tra conti).
    *   `32`: Movimenti Contabili (generica).
    *   `RILE`: Rilevazione Ritenute.

---

### Risposta alla Domanda 2: Puoi fare un Prospetto di Analisi Integrata?

Ora rifacciamo il prospetto utilizzando la potenza combinata di tutti i file. Selezionerò due nuovi casi significativi per illustrare le relazioni.

**Come si collegano i dati:**
Il processo si basa sull'uso di codici come "chiavi" per collegare le informazioni tra i file:
1.  Il `CODICE UNIVOCO` collega la testata (`PNTESTA`) alle sue righe di dettaglio (`PNRIGCON`).
2.  Il codice `CONTO` in `PNRIGCON` si collega alla `CODIFICA` in `CONTIGEN` per trovare la **descrizione del conto** (es. "Costi per servizi").
3.  Il `CODICE FISCALE` o la `SIGLA` del fornitore/cliente in `PNRIGCON` o `PNTESTA` si collega a `A_CLIFOR` per trovare i **dati anagrafici completi**.

---

### CASO 1: Fattura Multi-costo con IVA (FRS)

*   **Identificativo Testata:** `012025110002` (Fattura ROSSI SALVAT)
*   **Causale:** `FRS` - Fattura Ricevuta Split Payment

#### 1. Rappresentazione Visiva del Movimento Contabile (Arricchito)

Questa è la scrittura contabile completa, arricchita con le descrizioni prese dagli altri file.

| Riga | Conto | **Descrizione da CONTIGEN** | Dare (€) | Avere (€) | Note/Dettagli (da `PNRIGCON` e `A_CLIFOR`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `2010000215`| **Fornitore ROSSI SALVAT** (Anagrafica `A_CLIFOR`) | | 47,00 | Totale fattura n. 588 del 31/12/2024 |
| 2 | `6005000850`| **Acquisti Materie Prime** (Conto di costo) | 11,48 | | Rigo di costo della fattura 588 |
| 3 | `6018000940`| **Costi per Servizi Vari** (Conto di costo) | 21,32 | | Rigo di costo della fattura 588 |
| 4 | `6015000800`| **Cancelleria** (Conto di costo) | 5,72 | | Rigo di costo della fattura 588 |
| 5 | `1880000300`| **IVA su Acquisti** (Conto patrimoniale) | 8,48 | | Rigo IVA della fattura 588 |
| **Totale**| | | **47,00**| **47,00**| |

#### 2. Rappresentazione Visiva in Fase di Assegnazione

L'operatore deve assegnare ogni riga di costo (non l'IVA né il fornitore). L'uso del **Piano dei Conti (`CONTIGEN`)** è fondamentale qui, perché la descrizione del conto è l'indizio principale.

| Riga Costo | Importo da Assegnare (€) | **Commessa di Destinazione** | Voce di Costo Analitico | Indizi / Note per Assegnazione |
| :--- | :--- | :--- | :--- | :--- |
| 2 (`6005...`) | 11,48 | `PROG-A-01` | Materie Prime | **Indizio:** La descrizione "Acquisti Materie Prime" suggerisce un costo di produzione. L'operatore lo assegna al progetto corretto. |
| 3 (`6018...`) | 21,32 | `COMM-B-05` | Servizi Esterni | **Indizio:** "Costi per Servizi Vari". Potrebbe essere una lavorazione esterna per un'altra commessa. |
| 4 (`6015...`) | 5,72 | `COSTI-GEN-UFF`| Spese Generali | **Indizio:** La descrizione "Cancelleria" lo identifica come un costo di struttura, non direttamente imputabile a una commessa produttiva. |

#### 3. Rappresentazione Visiva nelle Commesse (una volta assegnato)

Il costo della singola fattura viene "smistato" su più centri di costo/commesse.

**Vista Dettaglio Commessa `PROG-A-01`:**
| Data | Tipo Costo | Fornitore / Note | Voce di Costo | Importo (€) |
| :--- | :--- | :--- | :--- | :--- |
| 02.01.25 | **Costo Effettivo (da FRS)** | ROSSI SALVAT (Fatt. 588) | Materie Prime | 11,48 |

**Vista Dettaglio Commessa `COMM-B-05`:**
| Data | Tipo Costo | Fornitore / Note | Voce di Costo | Importo (€) |
| :--- | :--- | :--- | :--- | :--- |
| 02.01.25 | **Costo Effettivo (da FRS)** | ROSSI SALVAT (Fatt. 588) | Servizi Esterni | 21,32 |

**Riepilogo Costi Generali (non di commessa):**
| Conto | Descrizione | Totale Costo (€) |
| :--- | :--- | :--- |
| `6015000800` | Cancelleria | 5,72 |

---

### CASO 2: Giroconto di Chiusura/Storno

*   **Identificativo Testata:** `012025110004`
*   **Causale:** `GIRO` - Giroconto

#### 1. Rappresentazione Visiva del Movimento Contabile (Arricchito)

Questo movimento non è un costo, ma una riclassificazione finanziaria.

| Riga | Conto | **Descrizione da CONTIGEN** | Dare (€) | Avere (€) | Note/Dettagli (da `PNRIGCON` e `A_CLIFOR`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `2010000035` | **Fornitore FIRST STEP** (Anagrafica `A_CLIFOR`) | 6,58 | | FATT 3895 del 31/12/2024 FIRST STEP |
| 2 | `1880000300` | **IVA su Acquisti** | | 6,58 | FATT 3895 del 31/12/2024 FIRST STEP |
| **Totale** | | | **6,58** | **6,58** | |

#### 2. Rappresentazione Visiva in Fase di Assegnazione

Questo movimento **NON deve essere assegnato a nessuna commessa**.

| Riga Costo | Importo da Assegnare (€) | **Commessa di Destinazione** | Voce di Costo Analitico | Indizi / Note per Assegnazione |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 6,58 | **NON APPLICABILE** | (N/A) | **Spiegazione:** Il movimento ha come contropartita un fornitore (`Dare`) e l'IVA (`Avere`). Non coinvolge un conto di costo economico. Si tratta probabilmente della chiusura di un debito o dello storno di un'IVA non dovuta. Non rappresenta un costo di produzione. |
| 2 | 6,58 | **NON APPLICABILE** | (N/A) | **Spiegazione:** Stesso motivo. |

#### 3. Rappresentazione Visiva nelle Commesse (una volta assegnato)

*   **Riepilogo di Commessa:** **Nessun impatto**. Questo movimento non appare in nessuna reportistica di commessa.
*   **Dettaglio Costi di Commessa:** **Nessun impatto**.

Questo prospetto evidenzia come, partendo da dati grezzi, l'integrazione con i file anagrafici (`A_CLIFOR`) e il piano dei conti (`CONTIGEN`) sia fondamentale non solo per dare un nome alle cose, ma soprattutto per **prendere decisioni corrette su cosa imputare a una commessa e come classificarlo**, separando i costi di produzione dai movimenti puramente contabili e finanziari.

------------------------------------------
------------------------------------------

mi riporti anche:
1. le Voce di Costo Analitico che rilevi da TUTTI i movimenti in modo tale che le potrei inserire com "automatismo" nelle commesse o lato piano dei conti non lo so, consigliami tu
2. altri esempi di "prospetti" con altre Tipologie di Movimento

-------------------------------------------
-------------------------------------------

Assolutamente. Ho analizzato l'intero file `PNRIGCON.TXT` per estrarre tutte le voci di costo e preparato una proposta per la loro classificazione analitica. Poi, ho creato i prospetti per altre tipologie di movimento, spiegando come si relazionano con il piano dei conti e le anagrafiche.

---

### 1. Voce di Costo Analitico Rilevate e Consiglio di Implementazione

Analizzando tutte le righe di costo (conti che iniziano per `6`, `7` o `8` in Dare) presenti nel file `PNRIGCON.TXT`, ho creato la seguente tabella. Questa tabella rappresenta il **primo passo fondamentale per l'automazione**: creare un "ponte" tra la contabilità generale e quella analitica di commessa.

**Consiglio su come implementare l'automatismo:**
La soluzione migliore non è modificare il piano dei conti (`CONTIGEN`), che deve rimanere allineato alle normative civilistiche e fiscali. Invece, si dovrebbe creare una **Tabella di Raccordo (o Tabella di Mapping)** nel vostro sistema di gestione (o anche in un semplice foglio di calcolo se il sistema non lo permette).

Questa tabella associa ogni Sottoconto di costo a una **"Voce di Costo Analitico" standardizzata** per le commesse.

**Tabella di Raccordo Proposta (Piano dei Conti Analitico):**

| Codice Conto (da Contabilità Generale) | Descrizione Conto (da CONTIGEN) | **Voce di Costo Analitico (Proposta per Commessa)** | Note per l'Assegnazione |
| :--- | :--- | :--- | :--- |
| `6005000150` | Acquisto Materiali | Materiale di Consumo | Costo diretto, da imputare alla commessa che usa il materiale. |
| `6005000850` | Acquisti Materie Prime | Carburanti e Lubrificanti | Costo diretto, da imputare a commesse con uso di mezzi d'opera/veicoli. |
| `6015000400` | Energia Elettrica | Utenze | Spesso è un costo indiretto da ripartire, ma se un cantiere ha un suo contatore, diventa un costo diretto della commessa. |
| `6015000751` | Costi per Lavorazioni | Lavorazioni Esterne | Costo diretto, da imputare alla commessa per cui è stata eseguita la lavorazione. |
| `6015000800` | Cancelleria | Spese Generali / di Struttura | **NON imputare a commesse specifiche**, ma a un centro di costo "Spese Generali" o "Uffici". |
| `6015002101` | Sottoconto di "PULIZIA LOCALI" | Pulizie di Cantiere | Costo diretto, se il servizio è per un cantiere specifico. |
| `6015002102` | Sottoconto di "PULIZIA LOCALI" | Pulizie di Cantiere | Costo diretto, come sopra. |
| `6015002700` | Acqua | Utenze | Come per l'energia elettrica. |
| `6015003710` | Costi Accessori Acquisti | Oneri e Spese Accessorie | Costo diretto, va assegnato alla stessa commessa del costo principale a cui si riferisce. |
| `6015007703` | Costi per Smaltimento Rifiuti | Smaltimento Rifiuti Speciali | Costo diretto, da imputare alla commessa che ha prodotto il rifiuto. |
| `6015009701` | Manutenzione e Riparazione Automezzi| Manutenzione Mezzi | Se un mezzo è assegnato a una specifica commessa, il costo è diretto. Altrimenti, è un costo indiretto da ripartire. |
| `6016000310` | Consulenze Professionali | Consulenze Tecniche/Legali | Da imputare alla commessa solo se la consulenza è specifica per quel progetto (es. perizia tecnica su un cantiere). Altrimenti è una spesa generale. |
| `6018000940` | Costi per Servizi Vari | Servizi Generici di Cantiere | Costo diretto, voce generica per servizi non classificati altrove. |
| `6020000450` | Altri Oneri Finanziari | Oneri Finanziari | **MAI imputare a una commessa**. È un costo di natura finanziaria, non operativa. |
| `6020001290` | Canoni di Leasing | Canoni Leasing Mezzi/Attrezz. | Costo diretto se il bene in leasing è usato esclusivamente per una commessa. |
| `6020001420` | Canoni di Leasing | Canoni Leasing Veicoli | Come sopra. |
| `6310000500` | Salari e Stipendi | Manodopera Diretta | Il costo della manodopera che lavora sulla commessa. Da imputare in base alle ore lavorate. |
| `6320000350` | Oneri Sociali | Oneri su Manodopera | Segue sempre l'imputazione del costo principale (Salari e Stipendi). |
| `7820001600` | Imposte e Tasse Deducibili | Oneri Amministrativi | **NON imputare a commessa**. È un costo di natura fiscale/amministrativa. |

---

### 2. Altri Esempi di Prospetti

Ecco altri tre esempi cruciali per capire come trattare movimenti diversi da una semplice fattura.

---

#### CASO 3: Giroconto (storno di una scrittura di assestamento)

*   **Identificativo Testata:** `012025110317`
*   **Causale:** `GIRO` - Giroconto
*   **Contesto:** Questo movimento è lo **storno** della fattura da ricevere `FTDR` relativa a "SORRENTO PRI" (`012025110316`). La fattura vera è finalmente arrivata e registrata (`FRS` con ID `012025110316`).

#### 1. Rappresentazione Visiva del Movimento Contabile

Questa scrittura chiude il debito presunto verso "Fatture da ricevere" e lo sposta sul fornitore reale.

| Riga | Conto | **Descrizione da CONTIGEN** | Dare (€) | Avere (€) | Note Originali |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `2010000220` | **Fornitore SORRENTO PRI** (Anagrafica `A_CLIFOR`) | | 61,60 | FATT 1/003 del 02/01/2025 SORRENTO PRI |
| 2 | `1880000300` | **IVA su Acquisti** | 61,60 | | FATT 1/003 del 02/01/2025 SORRENTO PRI |
| **Totale** | | | **61,60**| **61,60**| |

#### 2. Rappresentazione Visiva in Fase di Assegnazione

| Riga Costo | Importo da Assegnare (€) | **Commessa di Destinazione** | Voce di Costo Analitico | Indizi / Note per Assegnazione |
| :--- | :--- | :--- | :--- | :--- |
| 1 & 2 | 61,60 | **NON APPLICABILE** | (N/A) | **Spiegazione:** La causale è `GIRO`. Il movimento non tocca conti di costo economico (classe 6 o 7), ma solo conti patrimoniali (Fornitore e IVA). **Questo movimento NON genera costi per la commessa**. |

#### 3. Rappresentazione Visiva nella Commessa

*   **Nessun impatto**. Questo tipo di movimento finanziario/contabile non deve mai apparire nei report di costo di una commessa.

---

#### CASO 4: Pagamento di una Fattura

*   **Identificativo Testata:** `012025110297`
*   **Causale:** `PAGA` - Pagamento

#### 1. Rappresentazione Visiva del Movimento Contabile

Questa scrittura salda un debito verso un fornitore tramite un'uscita di banca.

| Riga | Conto | **Descrizione da CONTIGEN** | Dare (€) | Avere (€) | Note Originali |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `2010000379` | **Fornitore BANCA PRIVATA LEASING** | 1.057,21 | | BANCA PRIVAT FATT L2551/2025/1 del 01/01/2025|
| 2 | `2205000101` | **Banca 1 c/c UNICREDIT** | | 1.057,21 | |
| **Totale** | | | **1.057,21**| **1.057,21**| |

#### 2. Rappresentazione Visiva in Fase di Assegnazione

| Riga Costo | Importo da Assegnare (€) | **Commessa di Destinazione** | Voce di Costo Analitico | Indizi / Note per Assegnazione |
| :--- | :--- | :--- | :--- | :--- |
| 1 & 2 | 1.057,21| **NON APPLICABILE** | (N/A) | **Spiegazione:** Questo è un movimento **finanziario**, non economico. Il costo è stato già registrato con la fattura (`FTRI`/`FRS`). Questa operazione sposta solo denaro, riducendo il debito verso il fornitore e la liquidità in banca. Non impatta la marginalità della commessa. |

#### 3. Rappresentazione Visiva nella Commessa

*   **Nessun impatto sui costi di commessa**. Il pagamento è irrilevante per il calcolo della redditività del progetto. Potrebbe apparire in report di cash-flow di commessa, ma non nei costi.

---

#### CASO 5: Registrazione Costo del Personale

*   **Identificativo Testata:** `012025110724`
*   **Causale:** `STIP` - Stipendi

#### 1. Rappresentazione Visiva del Movimento Contabile (Estratto)

Questa è una scrittura complessa che rileva il costo lordo del personale e i relativi debiti verso dipendenti ed enti.

| Riga | Conto | **Descrizione da CONTIGEN** | Dare (€) | Avere (€) | Note Originali |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ... | ... | ... | ... | ... | ... |
| 18 | `6310000500` | **Salari e Stipendi** | 59.968,87 | | PAGHE GENNAIO PIANO DI SORRENTO |
| 7 | `6335000510` | **Oneri Sociali Personale** | 2.028,09 | | PAGHE GENNAIO PIANO DI SORRENTO |
| 9 | `6320000730` | **Oneri Sociali Personale** | 434,41 | | PAGHE GENNAIO PIANO DI SORRENTO |
| ... | ... | ... | ... | ... | ... |
| 1 | `4875000250`| **Personale c/Retribuzioni** | | 44.577,00 | Debito netto verso i dipendenti |
| 2 | `4855000050`| **Debiti Tributari** | | 6.155,61 | Debito per ritenute IRPEF |
| 3 | `4855000710`| **Debiti v/Enti Previdenziali** | | 1.616,95 | Debito INPS, ecc. |
| ... | ... | ... | ... | ... | ... |

#### 2. Rappresentazione Visiva in Fase di Assegnazione

| Riga Costo | Importo da Assegnare (€) | **Commessa di Destinazione** | Voce di Costo Analitico | Indizi / Note per Assegnazione |
| :--- | :--- | :--- | :--- | :--- |
| 18 (`631...`) | 59.968,87 | **DA RIPARTIRE** | Manodopera Diretta / Indiretta | **Indizio:** La nota "PAGHE GENNAIO PIANO DI SORRENTO" indica l'appartenenza a un'area/cantiere specifico. L'importo totale va ripartito tra le varie commesse di quel cantiere in base ai fogli ore dei dipendenti. Una parte potrebbe rimanere come costo indiretto (es. ore del capocantiere). |
| 7, 9, ... (`632...`, `633...`) | Vari | **DA RIPARTIRE** | Oneri su Manodopera | **Regola:** L'assegnazione degli oneri sociali segue proporzionalmente quella dei salari e stipendi. |

#### 3. Rappresentazione Visiva nella Commessa (una volta assegnato)

**Vista B: Dettaglio Costi di Commessa (ipotizzando una ripartizione)**

| Data | Tipo Costo | Fornitore / Note | Voce di Costo | Importo (€) |
| :--- | :--- | :--- | :--- | :--- |
| 31.01.25 | **Costo Effettivo (da STIP)** | Personale Cantiere Piano Sorrento| Manodopera Diretta | 4.500,00 |
| 31.01.25 | **Costo Effettivo (da STIP)** | Personale Cantiere Piano Sorrento| Oneri su Manodopera | 980,00 |