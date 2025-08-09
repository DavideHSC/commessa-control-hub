Ho analizzato l'intero file `PNRIGCON.TXT` per estrarre tutte le voci di costo e preparato una proposta per la loro classificazione analitica. Poi, ho creato i prospetti per altre tipologie di movimento, spiegando come si relazionano con il piano dei conti e le anagrafiche.

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