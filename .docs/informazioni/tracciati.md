<file_map>
//wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1
└── .docs
    └── dati_cliente
        └── tracciati
            └── modificati
                ├── A_CLIFOR.md
                ├── CAUSALI.md
                ├── CODICIVA.md
                ├── CODPAGAM.md
                ├── CONTIGEN.md
                ├── MOVANAC.md
                ├── PNRIGCON.md
                ├── PNRIGIVA.md
                └── PNTESTA.md

</file_map>

<file_contents>
File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/PNTESTA.md
```markdown
# PNTESTA.TXT - Tracciato Prima Nota Testata

**Data**: 10/01/2007  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 445 Bytes + CRLF = 447 Bytes  
**Nome File**: PNTESTA.TXT

## Struttura del Tracciato

| Campo                 | Tipo | Lunghezza | Posizione | Descrizione             |
| --------------------- | ---- | --------- | --------- | ----------------------- |
| **FILLER**            | A    | 3         | 1         | Dati Anagrafica Azienda |
| **CODICE FISCALE**    | A    | 16        | 4         | Codice fiscale azienda  |
| **SUBCODICE FISCALE** | A    | 1         | 20        | Subcodice fiscale       |

## Dati Generali

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                                                 |
| ---------------------------------- | ---- | --------- | --------- | ----------------------------------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12        | 21        | Identificativo univoco                                      |
| **CODICE ATTIVITA**                | A    | 2         | 33        | Codice attività                                             |
| **ESERCIZIO**                      | A    | 5         | 35        | Anno esercizio                                              |
| **CODICE CAUSALE**                 | A    | 6         | 40        | Codice causale (deve essere presente nella tabella causali) |
| **DESCRIZIONE CAUSALE**            | A    | 40        | 46        | Descrizione causale (facoltativa)                           |
| **DATA REGISTRAZIONE**             | N    | 8         | 86        | Data registrazione (GGMMAAAA)                               |

## Dati IVA

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                         |
| --------------------------------------- | ---- | --------- | --------- | ----------------------------------- |
| **CODICE ATTIVITA IVA**                 | A    | 2         | 94        | Codice attività IVA                 |
| **TIPO REGISTRO IVA**                   | A    | 1         | 96        | Tipo registro IVA                   |
|                                         |      |           |           | • A = Acquisti                      |
|                                         |      |           |           | • C = Corrispettivi                 |
|                                         |      |           |           | • V = Vendite                       |
| **CODICE NUMERAZIONE IVA**              | A    | 3         | 97        | Codice numerazione IVA              |
| **CLIENTE/FORNITORE CODICE FISCALE**    | A    | 16        | 100       | Codice fiscale cliente/fornitore    |
| **CLIENTE/FORNITORE SUBCODICE FISCALE** | A    | 1         | 116       | Subcodice fiscale cliente/fornitore |
| **CLIENTE/FORNITORE SIGLA**             | A    | 12        | 117       | Sigla cliente/fornitore             |

> **Nota**: L'identificazione del cliente/fornitore può essere effettuata o per codice fiscale (con eventuale subcodice) o per sigla. La preminenza viene comunque data al codice fiscale.

| Campo                | Tipo | Lunghezza | Posizione | Descrizione               |
| -------------------- | ---- | --------- | --------- | ------------------------- |
| **DOCUMENTO DATA**   | N    | 8         | 129       | Data documento (GGMMAAAA) |
| **DOCUMENTO NUMERO** | A    | 12        | 137       | Numero documento          |
| **DOCUMENTO BIS**    | A    | 1         | 149       | Bis documento             |

> **Nota**: Se si tratta di documenti di vendita o corrispettivi (escluse le fatture emesse su registro corrispettivi) numero e bis documento verranno impostati uguali a numero e bis protocollo.

| Campo                 | Tipo | Lunghezza | Posizione | Descrizione                  |
| --------------------- | ---- | --------- | --------- | ---------------------------- |
| **DATA REGISTRO IVA** | N    | 8         | 150       | Data registro IVA (GGMMAAAA) |
| **PROTOCOLLO NUMERO** | N    | 6         | 158       | Numero protocollo            |
| **PROTOCOLLO BIS**    | A    | 1         | 164       | Bis protocollo               |

> **Nota**: Nel caso di documenti di acquisto è possibile non indicare il numero e bis protocollo in questo caso la procedura lo assegnerà automaticamente.

| Campo                           | Tipo | Lunghezza | Posizione | Descrizione                                 |
| ------------------------------- | ---- | --------- | --------- | ------------------------------------------- |
| **DATA COMPETENZA LIQUID. IVA** | N    | 8         | 165       | Data competenza liquidazione IVA (GGMMAAAA) |
| **TOTALE DOCUMENTO**            | N    | 12        | 173       | Totale documento                            |

> **Nota**: L'intera sezione dati IVA viene portata solo se la causale ha Tipo documento IVA oppure se si tratta di un movimento contabile con la barratura di "movimento su registro IVA non rilevante ai fini IVA" e nell'esercizio la contabilità è Semplificata impresa o professionista con registri IVA integrati. Nel caso dei suddetti movimenti contabili non sono presenti in prima nota numero e bis documento e protocollo.

| Campo                         | Tipo | Lunghezza | Posizione | Descrizione                          |
| ----------------------------- | ---- | --------- | --------- | ------------------------------------ |
| **DATA COMPETENZA CONTABILE** | N    | 8         | 185       | Data competenza contabile (GGMMAAAA) |

> **Nota**: Se non viene impostata verrà portata la data di registrazione.

| Campo              | Tipo | Lunghezza | Posizione | Descrizione        |
| ------------------ | ---- | --------- | --------- | ------------------ |
| **NOTE MOVIMENTO** | A    | 60        | 193       | Note del movimento |

## Altri Dati

| Campo            | Tipo | Lunghezza | Posizione | Descrizione             |
| ---------------- | ---- | --------- | --------- | ----------------------- |
| **DATA PLAFOND** | N    | 8         | 253       | Data plafond (GGMMAAAA) |

> **Nota**: Data plafond viene portata solo se si tratta di un documento IVA di acquisto nell'anno della data documento è gestito il plafond (Anagrafica Azienda - Dati IVA annuali).

| Campo             | Tipo | Lunghezza | Posizione | Descrizione   |
| ----------------- | ---- | --------- | --------- | ------------- |
| **ANNO PRO-RATA** | N    | 4         | 261       | Anno Pro-Rata |

> **Nota**: Anno Pro-Rata viene portato solo se si tratta di un documento IVA di acquisto nell'anno della data documento è gestito il Pro-Rata (Attività - Dati IVA annuali).

## Ritenute Effettuate

| Campo        | Tipo | Lunghezza | Posizione | Descrizione      |
| ------------ | ---- | --------- | --------- | ---------------- |
| **RITENUTE** | N    | 12        | 265       | Importo ritenute |

> **Nota**: Vengono importate solo se nella causale Gest. Ritenute/Enasarco è impostato su Ritenuta o Ritenuta/Enasarco.

| Campo        | Tipo | Lunghezza | Posizione | Descrizione      |
| ------------ | ---- | --------- | --------- | ---------------- |
| **ENASARCO** | N    | 12        | 277       | Importo Enasarco |

> **Nota**: Vengono importate solo se nella causale Gest. Ritenute/Enasarco è impostato su Enasarco o Ritenuta/Enasarco.

## Valuta Estera

| Campo                | Tipo | Lunghezza | Posizione | Descrizione             |
| -------------------- | ---- | --------- | --------- | ----------------------- |
| **TOTALE IN VALUTA** | N    | 12        | 289       | Totale in valuta estera |
| **CODICE VALUTA**    | A    | 4         | 301       | Codice valuta           |

> **Nota**: I dati valuta estera vengono importati solo se nella causale c'è la barratura fattura in valuta estera.

## Dati Autofattura

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                    |
| ---------------------------------- | ---- | --------- | --------- | ------------------------------ |
| **CODICE NUMERAZIONE IVA VENDITE** | A    | 3         | 305       | Codice numerazione IVA vendite |
| **PROTOCOLLO NUMERO**              | N    | 6         | 308       | Numero protocollo              |
| **PROTOCOLLO BIS**                 | A    | 1         | 314       | Bis protocollo                 |

> **Nota**: I dati dell'autofattura vengono importati solo se nella causale c'è la barratura generazione autofattura.

## Versamento Ritenute

| Campo                  | Tipo | Lunghezza | Posizione | Descrizione                |
| ---------------------- | ---- | --------- | --------- | -------------------------- |
| **VERSAMENTO DATA**    | N    | 8         | 315       | Data versamento (GGMMAAAA) |
| **VERSAMENTO TIPO**    | A    | 1         | 323       | Tipo versamento            |
|                        |      |           |           | • 0 = F24 o F23            |
|                        |      |           |           | • 1 = Tesoreria            |
| **VERSAMENTO MODELLO** | A    | 1         | 324       | Modello versamento         |
|                        |      |           |           | • 0 = Nessuno              |
|                        |      |           |           | • 1 = Banca                |
|                        |      |           |           | • 2 = Concessione          |
|                        |      |           |           | • 3 = Posta                |
| **VERSAMENTO ESTREMI** | A    | 16        | 325       | Estremi versamento         |

> **Nota**: I dati della sezione versamento ritenute vengono importati solo se nella causale c'è la barratura versamento ritenute.

## Dati di Servizio

| Campo     | Tipo | Lunghezza | Posizione | Descrizione         |
| --------- | ---- | --------- | --------- | ------------------- |
| **STATO** | A    | 1         | 341       | Stato del movimento |
|           |      |           |           | • D = Definitiva    |
|           |      |           |           | • P = Provvisoria   |
|           |      |           |           | • V = Da verificare |

## Dati per Gestione Partite

> **Nota**: La gestione partite viene utilizzata solo se l'attività ha gestione partite e la causale ha gestione partite diverso da nessuna.

| Campo                     | Tipo | Lunghezza | Posizione | Descrizione                                     |
| ------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **TIPO GESTIONE PARTITE** | A    | 1         | 342       | Tipo gestione partite                           |
|                           |      |           |           | • (vuoto) = Nessuna                             |
|                           |      |           |           | • A = Creazione Partita                         |
|                           |      |           |           | • B = Inserimento rata in una partita esistente |
|                           |      |           |           | • C = Creazione Partita + rate                  |
|                           |      |           |           | • D = Automatica                                |

### Codice Pagamento (per tipo Automatica - D)

| Campo                | Tipo | Lunghezza | Posizione | Descrizione      |
| -------------------- | ---- | --------- | --------- | ---------------- |
| **CODICE PAGAMENTO** | A    | 8         | 343       | Codice pagamento |

### Dati per Inserimento rata in una partita esistente (B)

#### Dati della fattura da incassare/pagare

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                         |
| --------------------------------------- | ---- | --------- | --------- | ----------------------------------- |
| **CODICE ATTIVITA IVA**                 | A    | 2         | 351       | Codice attività IVA                 |
| **TIPO REGISTRO IVA**                   | A    | 1         | 353       | Tipo registro IVA                   |
|                                         |      |           |           | • A = Acquisti                      |
|                                         |      |           |           | • C = Corrispettivi                 |
|                                         |      |           |           | • V = Vendite                       |
| **CODICE NUMERAZIONE IVA**              | A    | 3         | 354       | Codice numerazione IVA              |
| **CLIENTE/FORNITORE CODICE FISCALE**    | A    | 16        | 357       | Codice fiscale cliente/fornitore    |
| **CLIENTE/FORNITORE SUBCODICE FISCALE** | A    | 1         | 373       | Subcodice fiscale cliente/fornitore |
| **CLIENTE/FORNITORE SIGLA**             | A    | 12        | 374       | Sigla cliente/fornitore             |

> **Nota**: L'identificazione del cliente/fornitore può essere effettuata o per codice fiscale (con eventuale subcodice) o per sigla. La preminenza viene comunque data alla sigla.

| Campo                | Tipo | Lunghezza | Posizione | Descrizione               |
| -------------------- | ---- | --------- | --------- | ------------------------- |
| **DOCUMENTO DATA**   | N    | 8         | 386       | Data documento (GGMMAAAA) |
| **DOCUMENTO NUMERO** | A    | 12        | 394       | Numero documento          |
| **DOCUMENTO BIS**    | A    | 1         | 406       | Bis documento             |

## Dati per Intrastat

| Campo                                 | Tipo | Lunghezza | Posizione | Descrizione                                   |
| ------------------------------------- | ---- | --------- | --------- | --------------------------------------------- |
| **CLI/FOR (INTRA) CODICE FISCALE**    | A    | 16        | 407       | Codice fiscale cliente/fornitore Intrastat    |
| **CLI/FOR (INTRA) SUBCODICE FISCALE** | A    | 1         | 423       | Subcodice fiscale cliente/fornitore Intrastat |
| **CLI/FOR (INTRA) SIGLA**             | A    | 12        | 424       | Sigla cliente/fornitore Intrastat             |

> **Nota**: L'identificazione del cliente/fornitore può essere effettuata o per codice fiscale (con eventuale subcodice) o per sigla. La preminenza viene comunque data al codice fiscale.

| Campo                        | Tipo | Lunghezza | Posizione | Descrizione                          |
| ---------------------------- | ---- | --------- | --------- | ------------------------------------ |
| **TIPO MOVIMENTO INTRASTAT** | A    | 2         | 436       | Tipo movimento Intrastat             |
|                              |      |           |           | • AA = Acquisto                      |
|                              |      |           |           | • AZ = Rettifica Acquisto            |
|                              |      |           |           | • VV = Vendita                       |
|                              |      |           |           | • VZ = Rettifica Vendita             |
| **DOCUMENTO OPERAZIONE**     | N    | 8         | 438       | Data documento operazione (GGMMAAAA) |

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 446       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Modalità di Trasferimento delle Sezioni Collegate

- **Per i movimenti contabili** ad eccezione dei movimenti con barratura semplificata non vengono letti i righi IVA.
- **I righi versamento ritenute** vengono letti se nella causale c'è la barratura versamento ritenute.
- **Nei movimenti con Tipo Gestione Partite** Creazione Partita + rate (C) le rate vanno specificate nella sezione Rate Inc/Pag.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato PNTESTA.TXT_

```

File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/CODICIVA.md
```markdown
# CODICIVA.TXT - Tracciato Codici IVA

**Data**: 19/12/2005  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 162 Bytes + CRLF = 164 Bytes  
**Nome File**: CODICIVA.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                  | Tipo | Lunghezza | Posizione | Descrizione                |
| ---------------------- | ---- | --------- | --------- | -------------------------- |
| **TABELLA ITALSTUDIO** | A    | 1         | 4         | Campo riservato Italstudio |
| **CODICE IVA**         | A    | 4         | 5         | Codice IVA                 |
| **DESCRIZIONE**        | A    | 40        | 9         | Descrizione                |

> **Nota**: Campo riservato Italstudio - non indicare nulla.

| Campo            | Tipo | Lunghezza | Posizione | Descrizione                         |
| ---------------- | ---- | --------- | --------- | ----------------------------------- |
| **TIPO CALCOLO** | A    | 1         | 49        | Tipo calcolo                        |
|                  |      |           |           | • N = Nessuno                       |
|                  |      |           |           | • O = Normale                       |
|                  |      |           |           | • A = Solo imposta                  |
|                  |      |           |           | • I = Imposta non assolta           |
|                  |      |           |           | • S = Scorporo                      |
|                  |      |           |           | • T = Scorporo per intrattenimento  |
|                  |      |           |           | • E = Esente/Non imponibile/Escluso |
|                  |      |           |           | • V = Ventilazione corrispettivi    |

| Campo                             | Tipo | Lunghezza | Posizione | Descrizione                     |
| --------------------------------- | ---- | --------- | --------- | ------------------------------- |
| **ALIQUOTA IVA**                  | N    | 6         | 50        | Aliquota IVA (999.99)           |
| **PERCENTUALE D'INDETRAIBILITA'** | N    | 3         | 56        | Percentuale d'indetraibilità    |
| **NOTE**                          | A    | 40        | 59        | Note                            |
| **DATA INIZIO VALIDITA'**         | N    | 8         | 99        | Data inizio validità (GGMMAAAA) |
| **DATA FINE VALIDITA'**           | N    | 8         | 107       | Data fine validità (GGMMAAAA)   |

| Campo                                | Tipo | Lunghezza | Posizione | Descrizione                          |
| ------------------------------------ | ---- | --------- | --------- | ------------------------------------ |
| **IMPONIBILE 50% DEI CORRISPETTIVI** | A    | 1         | 115       | Imponibile 50% dei corrispettivi (X) |
| **IMPOSTA INTRATTENIMENTI**          | A    | 2         | 116       | Imposta intrattenimenti              |
|                                      |      |           |           | • (vuoto) =                          |
|                                      |      |           |           | • 6 = 6%                             |
|                                      |      |           |           | • 8 = 8%                             |
|                                      |      |           |           | • 10 = 10%                           |
|                                      |      |           |           | • 16 = 16%                           |
|                                      |      |           |           | • 60 = 60%                           |

| Campo                             | Tipo | Lunghezza | Posizione | Descrizione                       |
| --------------------------------- | ---- | --------- | --------- | --------------------------------- |
| **VENTILAZIONE ALIQUOTA DIVERSA** | A    | 1         | 118       | Ventilazione aliquota diversa (X) |
| **ALIQUOTA DIVERSA**              | N    | 6         | 119       | Aliquota diversa (999.99)         |

## Gestione Plafond

| Campo                | Tipo | Lunghezza | Posizione | Descrizione         |
| -------------------- | ---- | --------- | --------- | ------------------- |
| **PLAFOND ACQUISTI** | A    | 1         | 125       | Plafond acquisti    |
|                      |      |           |           | • (vuoto) =         |
|                      |      |           |           | • I = Interno/Intra |
|                      |      |           |           | • E = Importazioni  |

| Campo               | Tipo | Lunghezza | Posizione | Descrizione        |
| ------------------- | ---- | --------- | --------- | ------------------ |
| **MONTE ACQUISTI**  | A    | 1         | 126       | Monte acquisti (X) |
| **PLAFOND VENDITE** | A    | 1         | 127       | Plafond vendite    |
|                     |      |           |           | • (vuoto) =        |
|                     |      |           |           | • E = Esportazioni |

| Campo                          | Tipo | Lunghezza | Posizione | Descrizione                    |
| ------------------------------ | ---- | --------- | --------- | ------------------------------ |
| **NO VOLUME D'AFFARI PLAFOND** | A    | 1         | 128       | No volume d'affari plafond (X) |
| **GESTIONE PRO RATA**          | A    | 1         | 129       | Gestione Pro Rata              |
|                                |      |           |           | • D = Volume d'affari          |
|                                |      |           |           | • E = Esente                   |
|                                |      |           |           | • N = Escluso                  |

## Comunicazioni Fiscali

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                               |
| --------------------------------------- | ---- | --------- | --------- | ----------------------------------------- |
| **ACQ. OPERAZ. IMPONIBILI OCCASIONALI** | A    | 1         | 130       | Acq. operaz. imponibili occasionali (X)   |
| **COMUNICAZIONE DATI IVA VENDITE**      | A    | 1         | 131       | Comunicazione dati IVA vendite            |
|                                         |      |           |           | • 1 = Op.Attive CD1.1                     |
|                                         |      |           |           | • 3 = Op.Attive (di cui non impon.) CD1.2 |
|                                         |      |           |           | • 4 = Op.Attive (di cui esenti) CD1.3     |
|                                         |      |           |           | • 2 = Op.Attive (di cui intra) CD1.4      |

| Campo                               | Tipo | Lunghezza | Posizione | Descrizione                                |
| ----------------------------------- | ---- | --------- | --------- | ------------------------------------------ |
| **AGEVOLAZIONI SUBFORNITURE**       | A    | 1         | 132       | Agevolazioni subforniture (X)              |
| **COMUNICAZIONE DATI IVA ACQUISTI** | A    | 1         | 133       | Comunicazione dati IVA acquisti            |
|                                     |      |           |           | • 1 = Op.Passive CD2.1                     |
|                                     |      |           |           | • 4 = Op.Passive (di cui non impon.) CD2.2 |
|                                     |      |           |           | • 5 = Op.Passive (di cui esenti) CD2.3     |
|                                     |      |           |           | • 2 = Op.Passive (di cui intra) CD2.4      |
|                                     |      |           |           | • 3 = Importazioni oro/argento CD3.1 CD3.2 |
|                                     |      |           |           | • 6 = Importazioni rottami CD3.3 CD3.4     |

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                             |
| --------------------------------------- | ---- | --------- | --------- | --------------------------------------- |
| **AUTOFATTURA REVERSE CHARGE**          | A    | 1         | 134       | Autofattura reverse charge (X)          |
| **OPERAZIONE ESENTE OCCASIONALE**       | A    | 1         | 135       | Operazione esente occasionale (X)       |
| **CES. ART.38 QUATER C.2 (STORNO IVA)** | A    | 1         | 136       | Ces. art.38 quater c.2 (storno IVA) (X) |

## Regimi Speciali

### Agricoltura

| Campo                           | Tipo | Lunghezza | Posizione | Descrizione                                |
| ------------------------------- | ---- | --------- | --------- | ------------------------------------------ |
| **PERC. DA DETRARRE SU EXPORT** | N    | 6         | 137       | Percentuale da detrarre su export (999.99) |
| **ACQUISTI/CESSIONI**           | A    | 1         | 143       | Acquisti/cessioni                          |
|                                 |      |           |           | • (vuoto) =                                |
|                                 |      |           |           | • A = Tabella A1                           |
|                                 |      |           |           | • B = Beni Attività connesse               |

| Campo                            | Tipo | Lunghezza | Posizione | Descrizione                           |
| -------------------------------- | ---- | --------- | --------- | ------------------------------------- |
| **PERCENTUALE DI COMPENSAZIONE** | N    | 6         | 144       | Percentuale di compensazione (999.99) |
| **BENI AMMORTIZZABILI**          | A    | 1         | 150       | Beni ammortizzabili (X)               |

### Agenzie di Viaggio

| Campo                               | Tipo | Lunghezza | Posizione | Descrizione                        |
| ----------------------------------- | ---- | --------- | --------- | ---------------------------------- |
| **INDICATORE TERRITORIALE VENDITE** | A    | 2         | 151       | Indicatore territoriale vendite    |
|                                     |      |           |           | • (vuoto) =                        |
|                                     |      |           |           | • VC = Vendita CEE                 |
|                                     |      |           |           | • VX = Vendita Extra CEE           |
|                                     |      |           |           | • VM = Vendita Mista CEE/Extra CEE |

| Campo                                | Tipo | Lunghezza | Posizione | Descrizione                           |
| ------------------------------------ | ---- | --------- | --------- | ------------------------------------- |
| **PROVVIGIONI DM 340/99 ART.7 C.3**  | A    | 1         | 153       | Provvigioni DM 340/99 art.7 c.3 (X)   |
| **INDICATORE TERRITORIALE ACQUISTI** | A    | 2         | 154       | Indicatore territoriale acquisti      |
|                                      |      |           |           | • (vuoto) =                           |
|                                      |      |           |           | • AC = Acquisto CEE                   |
|                                      |      |           |           | • AX = Acquisto Extra CEE             |
|                                      |      |           |           | • MC = Acquisto misto parte CEE       |
|                                      |      |           |           | • MX = Acquisto misto parte Extra CEE |

### Beni Usati

| Campo                   | Tipo | Lunghezza | Posizione | Descrizione             |
| ----------------------- | ---- | --------- | --------- | ----------------------- |
| **METODO DA APPLICARE** | A    | 1         | 156       | Metodo da applicare     |
|                         |      |           |           | • (vuoto) =             |
|                         |      |           |           | • T = Analitico/Globale |
|                         |      |           |           | • F = Forfetario        |

| Campo                      | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------------------- | ---- | --------- | --------- | ---------------------- |
| **PERCENTUALE FORFETARIA** | A    | 2         | 157       | Percentuale forfetaria |
|                            |      |           |           | • (vuoto) =            |
|                            |      |           |           | • 25 = 25%             |
|                            |      |           |           | • 50 = 50%             |
|                            |      |           |           | • 60 = 60%             |

| Campo                               | Tipo | Lunghezza | Posizione | Descrizione                         |
| ----------------------------------- | ---- | --------- | --------- | ----------------------------------- |
| **ANALITICO (BENI AMMORTIZZABILI)** | A    | 1         | 159       | Analitico (beni ammortizzabili) (X) |

### Intrattenimenti

| Campo                | Tipo | Lunghezza | Posizione | Descrizione             |
| -------------------- | ---- | --------- | --------- | ----------------------- |
| **QUOTA FORFETARIA** | A    | 1         | 160       | Quota forfetaria        |
|                      |      |           |           | • (vuoto) =             |
|                      |      |           |           | • 1 = 1/10 dell'imposta |
|                      |      |           |           | • 2 = 1/2 dell'imposta  |
|                      |      |           |           | • 3 = 1/3 dell'imposta  |

## Altri Dati

| Campo                            | Tipo | Lunghezza | Posizione | Descrizione                  |
| -------------------------------- | ---- | --------- | --------- | ---------------------------- |
| **ACQUISTI INTRACOMUNITARI**     | A    | 1         | 161       | Acquisti intracomunitari (X) |
| **CESSIONE PRODOTTI EDITORIALI** | A    | 1         | 162       | Cessione prodotti editoriali |

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 163       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato CODICIVA.TXT_

```

File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/A_CLIFOR.md
```markdown
# A_CLIFOR.TXT - Tracciato Anagrafica Clienti/Fornitori

**Data**: 10/07/2007  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 338 Bytes + CRLF = 340 Bytes  
**Nome File**: A_CLIFOR.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Anagrafica Azienda

| Campo                      | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------------------- | ---- | --------- | --------- | ---------------------- |
| **CODICE FISCALE AZIENDA** | A    | 16        | 4         | Codice fiscale azienda |
| **SUBCODICE AZIENDA**      | A    | 1         | 20        | Subcodice azienda      |

## Dati Generali

| Campo                                | Tipo | Lunghezza | Posizione | Descrizione                      |
| ------------------------------------ | ---- | --------- | --------- | -------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO**   | A    | 12        | 21        | Codice univoco di scaricamento   |
| **CODICE FISCALE CLIENTE/FORNITORE** | A    | 16        | 33        | Codice fiscale cliente/fornitore |
| **SUBCODICE CLIENTE/FORNITORE**      | A    | 1         | 49        | Subcodice cliente/fornitore      |
| **TIPO CONTO**                       | A    | 1         | 50        | Tipo conto                       |
|                                      |      |           |           | • C = Cliente                    |
|                                      |      |           |           | • F = Fornitore                  |
|                                      |      |           |           | • E = Entrambi                   |

| Campo                    | Tipo | Lunghezza | Posizione | Descrizione                            |
| ------------------------ | ---- | --------- | --------- | -------------------------------------- |
| **SOTTOCONTO CLIENTE**   | A    | 10        | 51        | Sottoconto cliente (MMCC/MMCCSSSSSS)   |
| **SOTTOCONTO FORNITORE** | A    | 10        | 61        | Sottoconto fornitore (MMCC/MMCCSSSSSS) |

> **Nota**: Se si specifica un conto (codifica MMCC) il sottoconto verrà assegnato automaticamente.

| Campo                 | Tipo | Lunghezza | Posizione | Descrizione            |
| --------------------- | ---- | --------- | --------- | ---------------------- |
| **CODICE ANAGRAFICA** | A    | 12        | 71        | Codice anagrafica      |
| **PARTITA IVA**       | N    | 11        | 83        | Partita IVA            |
| **TIPO SOGGETTO**     | N    | 1         | 94        | Tipo soggetto          |
|                       |      |           |           | • 0 = Persona Fisica   |
|                       |      |           |           | • 1 = Soggetto Diverso |

| Campo                             | Tipo | Lunghezza | Posizione | Descrizione                   |
| --------------------------------- | ---- | --------- | --------- | ----------------------------- |
| **DENOMINAZIONE/RAGIONE SOCIALE** | A    | 60        | 95        | Denominazione/ragione sociale |

## Dati Anagrafici Persona Fisica (\*)

| Campo                                  | Tipo | Lunghezza | Posizione | Descrizione                        |
| -------------------------------------- | ---- | --------- | --------- | ---------------------------------- |
| **COGNOME**                            | A    | 20        | 155       | Cognome                            |
| **NOME**                               | A    | 20        | 175       | Nome                               |
| **SESSO**                              | A    | 1         | 195       | Sesso                              |
|                                        |      |           |           | • M = Maschio                      |
|                                        |      |           |           | • F = Femmina                      |
| **DATA DI NASCITA**                    | N    | 8         | 196       | Data di nascita (GGMMAAAA)         |
| **CODICE CATASTALE COMUNE DI NASCITA** | A    | 4         | 204       | Codice catastale comune di nascita |

## Dati Anagrafici Persona Fisica/Sogg. Div.

| Campo                                      | Tipo | Lunghezza | Posizione | Descrizione                                      |
| ------------------------------------------ | ---- | --------- | --------- | ------------------------------------------------ |
| **COD. CAT. COMUNE DI RESID./SEDE LEGALE** | A    | 4         | 208       | Codice catastale comune di residenza/sede legale |
| **CAP DI RESIDENZA/SEDE LEGALE**           | N    | 5         | 212       | CAP di residenza/sede legale                     |
| **INDIRIZZO DI RESIDENZA/SEDE LEGALE**     | A    | 30        | 217       | Indirizzo di residenza/sede legale               |
| **PREFISSO TELEFONO**                      | N    | 4         | 247       | Prefisso telefono                                |
| **NUMERO DI TELEFONO**                     | N    | 11        | 251       | Numero di telefono                               |
| **IDENTIFICATIVO FISCALE ESTERO**          | A    | 20        | 262       | Identificativo fiscale estero                    |
| **CODICE ISO**                             | A    | 2         | 282       | Codice ISO                                       |

### Codici ISO Supportati

| Codice | Paese                 |
| ------ | --------------------- |
| AT     | Austria               |
| BE     | Belgio                |
| CY     | Cipro                 |
| CZ     | Repubblica Ceca       |
| DE     | Germania              |
| DK     | Danimarca             |
| EE     | Estonia               |
| EL     | Grecia                |
| ES     | Spagna                |
| EX     | Extra CEE             |
| FI     | Finlandia             |
| FR     | Francia               |
| GB     | Gran Bretagna         |
| HU     | Ungheria              |
| IE     | Irlanda               |
| IT     | Italia                |
| LT     | Lituania              |
| LU     | Lussemburgo           |
| LV     | Lettonia              |
| MT     | Malta                 |
| NL     | Olanda                |
| PL     | Polonia               |
| PT     | Portogallo            |
| SE     | Svezia                |
| SI     | Slovenia              |
| SK     | Repubblica Slovacca   |
| SM     | Repubblica San Marino |

## Dati per Sottoconto Cliente/Fornitore

| Campo                                    | Tipo | Lunghezza | Posizione | Descrizione                          |
| ---------------------------------------- | ---- | --------- | --------- | ------------------------------------ |
| **CODICE INCASSO/PAGAMENTO (TABELLE)**   | A    | 8         | 284       | Codice incasso/pagamento (tabelle)   |
| **CODICE INC./PAG. CLIENTE (AZIENDA)**   | A    | 8         | 292       | Codice inc./pag. cliente (azienda)   |
| **CODICE INC./PAG. FORNITORE (AZIENDA)** | A    | 8         | 300       | Codice inc./pag. fornitore (azienda) |
| **CODICE VALUTA**                        | A    | 4         | 308       | Codice valuta                        |

## Dati per Sottoconto Fornitore

| Campo                   | Tipo | Lunghezza | Posizione | Descrizione                   |
| ----------------------- | ---- | --------- | --------- | ----------------------------- |
| **GESTIONE DATI 770**   | A    | 1         | 312       | Gestione dati 770 (X)         |
| **SOGGETTO A RITENUTA** | A    | 1         | 313       | Soggetto a ritenuta (X)       |
| **QUADRO 770**          | A    | 1         | 314       | Quadro 770                    |
|                         |      |           |           | • (vuoto) =                   |
|                         |      |           |           | • 0 = Lavoro autonomo         |
|                         |      |           |           | • 1 = Provvigioni             |
|                         |      |           |           | • 2 = Lavoro autonomo imposta |

| Campo                        | Tipo | Lunghezza | Posizione | Descrizione                  |
| ---------------------------- | ---- | --------- | --------- | ---------------------------- |
| **CONTRIBUTO PREVIDENZIALE** | A    | 1         | 315       | Contributo previdenziale (X) |
| **CODICE RITENUTA**          | A    | 5         | 316       | Codice ritenuta              |
| **ENASARCO**                 | A    | 1         | 321       | Enasarco (X)                 |
| **TIPO RITENUTA**            | A    | 1         | 322       | Tipo ritenuta                |
|                              |      |           |           | • (vuoto) =                  |
|                              |      |           |           | • A = a titolo d'acconto     |
|                              |      |           |           | • I = a titolo d'imposta     |
|                              |      |           |           | • M = Manuale                |

| Campo                                 | Tipo | Lunghezza | Posizione | Descrizione                           |
| ------------------------------------- | ---- | --------- | --------- | ------------------------------------- |
| **SOGGETTO INAIL**                    | A    | 1         | 323       | Soggetto INAIL (X)                    |
| **CONTRIBUTO PREVIDENZIALE L.335/95** | A    | 1         | 324       | Contributo previdenziale L.335/95     |
|                                       |      |           |           | • 0 = Non soggetto                    |
|                                       |      |           |           | • 1 = Soggetto                        |
|                                       |      |           |           | • 2 = Soggetto con imponibile manuale |
|                                       |      |           |           | • 3 = Soggetto con calcolo manuale    |

| Campo                             | Tipo | Lunghezza | Posizione | Descrizione                               |
| --------------------------------- | ---- | --------- | --------- | ----------------------------------------- |
| **ALIQUOTA**                      | N    | 6         | 325       | Aliquota (999.99)                         |
| **% CONTRIBUTO CASSA PREVID.**    | N    | 6         | 331       | % Contributo cassa previdenziale (999.99) |
| **ATTIVITA' PER MENSILIZZAZIONE** | N    | 2         | 337       | Attività per mensilizzazione              |

> **Nota**: Le sezioni contrassegnate da (\*) devono essere impostate se TIPO SOGGETTO è 0 - Persona Fisica.

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 339       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato A_CLIFOR.TXT_

```

File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/CONTIGEN.md
```markdown
# CONTIGEN.TXT - Tracciato Piano dei Conti Generale

**Data**: 07/12/2006  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 388 Bytes + CRLF = 390 Bytes  
**Nome File**: CONTIGEN.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                  | Tipo | Lunghezza | Posizione | Descrizione                |
| ---------------------- | ---- | --------- | --------- | -------------------------- |
| **TABELLA ITALSTUDIO** | A    | 1         | 4         | Campo riservato Italstudio |

> **Nota**: Campo riservato Italstudio - non indicare nulla.

| Campo       | Tipo | Lunghezza | Posizione | Descrizione      |
| ----------- | ---- | --------- | --------- | ---------------- |
| **LIVELLO** | A    | 1         | 5         | Livello conto    |
|             |      |           |           | • 1 = Mastro     |
|             |      |           |           | • 2 = Conto      |
|             |      |           |           | • 3 = Sottoconto |

| Campo           | Tipo | Lunghezza | Posizione | Descrizione                   |
| --------------- | ---- | --------- | --------- | ----------------------------- |
| **CODIFICA**    | A    | 10        | 6         | Codifica (MM/MMCC/MMCCSSSSSS) |
| **DESCRIZIONE** | A    | 60        | 16        | Descrizione conto             |
| **TIPO**        | A    | 1         | 76        | Tipo conto                    |
|                 |      |           |           | • P = Patrimoniale            |
|                 |      |           |           | • E = Economico               |
|                 |      |           |           | • O = Conto d'ordine          |
|                 |      |           |           | • C = Cliente                 |
|                 |      |           |           | • F = Fornitore               |

| Campo               | Tipo | Lunghezza | Posizione | Descrizione     |
| ------------------- | ---- | --------- | --------- | --------------- |
| **SIGLA**           | A    | 12        | 77        | Sigla conto     |
| **CONTROLLO SEGNO** | A    | 1         | 89        | Controllo segno |
|                     |      |           |           | • (vuoto) =     |
|                     |      |           |           | • A = Avere     |
|                     |      |           |           | • D = Dare      |

| Campo                            | Tipo | Lunghezza | Posizione | Descrizione                  |
| -------------------------------- | ---- | --------- | --------- | ---------------------------- |
| **CONTO COSTI/RICAVI COLLEGATO** | A    | 10        | 90        | Conto costi/ricavi collegato |

## Tipo Contabilità

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                            |
| --------------------------------------- | ---- | --------- | --------- | -------------------------------------- |
| **VALIDO PER IMPRESA ORDINARIA**        | A    | 1         | 100       | Valido per impresa ordinaria           |
| **VALIDO PER IMPRESA SEMPLIFICATA**     | A    | 1         | 101       | Valido per impresa semplificata        |
| **VALIDO PER PROFESSIONISTA ORDINARIA** | A    | 1         | 102       | Valido per professionista ordinaria    |
| **VALIDO PER PROF. SEMPLIFICATA**       | A    | 1         | 103       | Valido per professionista semplificata |

## Tipo Dichiarazione

| Campo                    | Tipo | Lunghezza | Posizione | Descrizione          |
| ------------------------ | ---- | --------- | --------- | -------------------- |
| **VALIDO PER UNICO PF**  | A    | 1         | 104       | Valido per Unico PF  |
| **VALIDO PER UNICO SP**  | A    | 1         | 105       | Valido per Unico SP  |
| **VALIDO PER UNICO SC**  | A    | 1         | 106       | Valido per Unico SC  |
| **VALIDO PER UNICO ENC** | A    | 1         | 107       | Valido per Unico ENC |

## Categorie Fiscali

| Campo                                 | Tipo | Lunghezza | Posizione | Descrizione                       |
| ------------------------------------- | ---- | --------- | --------- | --------------------------------- |
| **CODICE CLASSE IRPEF/IRES**          | A    | 10        | 108       | Codice classe IRPEF/IRES          |
| **CODICE CLASSE IRAP**                | A    | 10        | 118       | Codice classe IRAP                |
| **CODICE CLASSE PROFESSIONISTA**      | A    | 10        | 128       | Codice classe professionista      |
| **CODICE CLASSE IRAP PROFESSIONISTA** | A    | 10        | 138       | Codice classe IRAP professionista |
| **CODICE CLASSE IVA**                 | A    | 10        | 148       | Codice classe IVA                 |

## Registro Professionisti

| Campo                                     | Tipo | Lunghezza | Posizione | Descrizione                               |
| ----------------------------------------- | ---- | --------- | --------- | ----------------------------------------- |
| **NUMERO COLONNA REG. CRONOLOGICO**       | N    | 4         | 158       | Numero colonna registro cronologico       |
| **NUMERO COLONNA REG. INCASSI/PAGAMENTI** | N    | 4         | 162       | Numero colonna registro incassi/pagamenti |

## Piano dei Conti CEE

| Campo           | Tipo | Lunghezza | Posizione | Descrizione |
| --------------- | ---- | --------- | --------- | ----------- |
| **CONTO DARE**  | A    | 12        | 166       | Conto dare  |
| **CONTO AVERE** | A    | 12        | 178       | Conto avere |

## Altri Dati

| Campo                            | Tipo | Lunghezza | Posizione | Descrizione                        |
| -------------------------------- | ---- | --------- | --------- | ---------------------------------- |
| **NATURA CONTO**                 | A    | 4         | 190       | Natura conto                       |
| **GESTIONE BENI AMMORTIZZABILI** | A    | 1         | 194       | Gestione beni ammortizzabili       |
|                                  |      |           |           | • (vuoto) =                        |
|                                  |      |           |           | • M = Immobilizzazioni Materiali   |
|                                  |      |           |           | • I = Immobilizzazioni Immateriali |
|                                  |      |           |           | • S = Fondo Svalutazione           |

| Campo                           | Tipo | Lunghezza | Posizione | Descrizione                                    |
| ------------------------------- | ---- | --------- | --------- | ---------------------------------------------- |
| **PERC. DED. MANUT. SE <> 100** | N    | 6         | 195       | Percentuale deducibilità manutenzione (999.99) |
| **FILLER**                      | A    | 56        | 201       | Filler                                         |
| **GRUPPO**                      | A    | 1         | 257       | Gruppo conto                                   |
|                                 |      |           |           | • (vuoto) =                                    |
|                                 |      |           |           | • A = Attività                                 |
|                                 |      |           |           | • C = Costo                                    |
|                                 |      |           |           | • N = Patrimonio Netto (\*)                    |
|                                 |      |           |           | • P = Passività                                |
|                                 |      |           |           | • R = Ricavo                                   |
|                                 |      |           |           | • V = Rettifiche di Costo (\*)                 |
|                                 |      |           |           | • Z = Rettifiche di Ricavo (\*)                |

> **Nota**: Il campo gruppo non deve essere impostato se il campo tipo è uguale a O-Conto d'ordine, C-Cliente e F-Fornitore. I codici contrassegnati con (\*) non devono essere utilizzati se livello è uguale a 1-Mastro.

## Categorie Fiscali (Estese)

| Campo                                        | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------------------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CODICE CLASSE DATI EXTRACONT. STUDI SET.** | A    | 10        | 258       | Codice classe dati extracontabili studi settore |

## Altri Dati (Estesi)

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                            |
| ---------------------------------- | ---- | --------- | --------- | -------------------------------------- |
| **DETTAGLIO CLI./FOR. PRIMA NOTA** | A    | 1         | 268       | Dettaglio cliente/fornitore prima nota |
|                                    |      |           |           | • (vuoto) =                            |
|                                    |      |           |           | • 1 = Cliente                          |
|                                    |      |           |           | • 2 = Fornitore                        |
|                                    |      |           |           | • 3 = Cliente/Fornitore                |

| Campo                          | Tipo | Lunghezza | Posizione | Descrizione                |
| ------------------------------ | ---- | --------- | --------- | -------------------------- |
| **DESCRIZIONE BILANCIO DARE**  | A    | 60        | 269       | Descrizione bilancio dare  |
| **DESCRIZIONE BILANCIO AVERE** | A    | 60        | 329       | Descrizione bilancio avere |

> **Nota**: Non è consentito impostare livello Sottoconto se il Tipo è Cliente o Fornitore.

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 389       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato CONTIGEN.TXT_

```

File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/CAUSALI.md
```markdown
# CAUSALI.TXT - Tracciato Causali Contabili

**Data**: 19/12/2005  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 171 Bytes + CRLF = 173 Bytes  
**Nome File**: CAUSALI.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                   | Tipo | Lunghezza | Posizione | Descrizione                |
| ----------------------- | ---- | --------- | --------- | -------------------------- |
| **TABELLA ITALSTUDIO**  | A    | 1         | 4         | Campo riservato Italstudio |
| **CODICE CAUSALE**      | A    | 6         | 5         | Codice causale             |
| **DESCRIZIONE CAUSALE** | A    | 40        | 11        | Descrizione causale        |

> **Nota**: Campo riservato Italstudio - non indicare nulla.

| Campo              | Tipo | Lunghezza | Posizione | Descrizione         |
| ------------------ | ---- | --------- | --------- | ------------------- |
| **TIPO MOVIMENTO** | A    | 1         | 51        | Tipo movimento      |
|                    |      |           |           | • C = Contabile     |
|                    |      |           |           | • I = Contabile/Iva |

| Campo                  | Tipo | Lunghezza | Posizione | Descrizione             |
| ---------------------- | ---- | --------- | --------- | ----------------------- |
| **TIPO AGGIORNAMENTO** | A    | 1         | 52        | Tipo aggiornamento      |
|                        |      |           |           | • I = Saldo Iniziale    |
|                        |      |           |           | • P = Saldo Progressivo |
|                        |      |           |           | • F = Saldo Finale      |

| Campo                     | Tipo | Lunghezza | Posizione | Descrizione          |
| ------------------------- | ---- | --------- | --------- | -------------------- |
| **DATA INIZIO VALIDITA'** | N    | 8         | 53        | Data inizio validità |
| **DATA FINE VALIDITA'**   | N    | 8         | 61        | Data fine validità   |

## Movimento IVA

| Campo                 | Tipo | Lunghezza | Posizione | Descrizione         |
| --------------------- | ---- | --------- | --------- | ------------------- |
| **TIPO REGISTRO IVA** | A    | 1         | 69        | Tipo registro IVA   |
|                       |      |           |           | • (vuoto) =         |
|                       |      |           |           | • A = Acquisti      |
|                       |      |           |           | • C = Corrispettivi |
|                       |      |           |           | • V = Vendite       |

| Campo                   | Tipo | Lunghezza | Posizione | Descrizione          |
| ----------------------- | ---- | --------- | --------- | -------------------- |
| **SEGNO MOVIMENTO IVA** | A    | 1         | 70        | Segno movimento IVA  |
|                         |      |           |           | • (vuoto) =          |
|                         |      |           |           | • I = Incrementa (+) |
|                         |      |           |           | • D = Decrementa (-) |

| Campo         | Tipo | Lunghezza | Posizione | Descrizione |
| ------------- | ---- | --------- | --------- | ----------- |
| **CONTO IVA** | A    | 10        | 71        | Conto IVA   |

## Altre Gestioni

| Campo                         | Tipo | Lunghezza | Posizione | Descrizione                 |
| ----------------------------- | ---- | --------- | --------- | --------------------------- |
| **GENERAZIONE AUTOFATTURA**   | A    | 1         | 81        | Generazione autofattura (X) |
| **TIPO AUTOFATTURA GENERATA** | A    | 1         | 82        | Tipo autofattura generata   |
|                               |      |           |           | • A = Altre Gestioni        |
|                               |      |           |           | • C = Cee                   |
|                               |      |           |           | • E = Reverse Charge        |
|                               |      |           |           | • R = Rsm                   |

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                             |
| --------------------------------------- | ---- | --------- | --------- | --------------------------------------- |
| **CONTO IVA VENDITE**                   | A    | 10        | 83        | Conto IVA vendite                       |
| **FATTURA IMPORTO 0**                   | A    | 1         | 93        | Fattura importo 0 (X)                   |
| **FATTURA IN VALUTA ESTERA**            | A    | 1         | 94        | Fattura in valuta estera (X)            |
| **NON CONSIDERARE IN LIQUIDAZIONE IVA** | A    | 1         | 95        | Non considerare in liquidazione IVA (X) |

| Campo                          | Tipo | Lunghezza | Posizione | Descrizione                     |
| ------------------------------ | ---- | --------- | --------- | ------------------------------- |
| **IVA ESIGIBILITA' DIFFERITA** | A    | 1         | 96        | IVA esigibilità differita       |
|                                |      |           |           | • N = Nessuna                   |
|                                |      |           |           | • E = Emessa/Ricevuta Fattura   |
|                                |      |           |           | • I = Incasso/Pagamento Fattura |

| Campo                                 | Tipo | Lunghezza | Posizione | Descrizione                              |
| ------------------------------------- | ---- | --------- | --------- | ---------------------------------------- |
| **FAT. EMESSA SU REG. CORRISPETTIVI** | A    | 1         | 97        | Fattura emessa su reg. corrispettivi (X) |
| **GESTIONE PARTITE**                  | A    | 1         | 98        | Gestione partite                         |
|                                       |      |           |           | • N = Nessuna                            |
|                                       |      |           |           | • A = Creazione + Chiusura automatica    |
|                                       |      |           |           | • C = Creazione                          |
|                                       |      |           |           | • H = Creazione + Chiusura               |

| Campo                          | Tipo | Lunghezza | Posizione | Descrizione                |
| ------------------------------ | ---- | --------- | --------- | -------------------------- |
| **GESTIONE INTRASTAT**         | A    | 1         | 99        | Gestione Intrastat (X)     |
| **GESTIONE RITENUTE/ENASARCO** | A    | 1         | 100       | Gestione ritenute/Enasarco |
|                                |      |           |           | • (vuoto) =                |
|                                |      |           |           | • R = Ritenuta             |
|                                |      |           |           | • E = Enasarco             |
|                                |      |           |           | • T = Ritenuta/Enasarco    |

| Campo                   | Tipo | Lunghezza | Posizione | Descrizione             |
| ----------------------- | ---- | --------- | --------- | ----------------------- |
| **VERSAMENTO RITENUTE** | A    | 1         | 101       | Versamento ritenute (X) |
| **NOTE MOVIMENTO**      | A    | 60        | 102       | Note movimento          |

## Impostazioni per Stampe

| Campo                                    | Tipo | Lunghezza | Posizione | Descrizione                              |
| ---------------------------------------- | ---- | --------- | --------- | ---------------------------------------- |
| **DESCRIZIONE DOCUMENTO**                | A    | 5         | 162       | Descrizione documento                    |
| **ST. IDENTIFICATIVO ESTERO CLI./FOR.**  | A    | 1         | 167       | St. identificativo estero cli./for. (X)  |
| **SCRITTURA RETTIFICA/ASSESTAMENTO**     | A    | 1         | 168       | Scrittura rettifica/assestamento (X)     |
| **NON STAMPARE SU REG. CRON./INC. PAG.** | A    | 1         | 169       | Non stampare su reg. cron./inc. pag. (X) |

## Contabilità Semplificata

| Campo                                    | Tipo | Lunghezza | Posizione | Descrizione                              |
| ---------------------------------------- | ---- | --------- | --------- | ---------------------------------------- |
| **MOV. SU REG.IVA NON RIL. AI FINI IVA** | A    | 1         | 170       | Mov. su reg.IVA non ril. ai fini IVA (X) |
| **TIPO MOVIMENTO**                       | A    | 1         | 171       | Tipo movimento                           |
|                                          |      |           |           | • (vuoto) =                              |
|                                          |      |           |           | • C = Costi                              |
|                                          |      |           |           | • R = Ricavi                             |

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 172       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato CAUSALI.TXT_

```

File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/PNRIGCON.md
```markdown
# PNRIGCON.TXT - Tracciato Prima Nota Righe Contabili

**Data**: 19/09/2012  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 312 Bytes + CRLF = 314 Bytes  
**Nome File**: PNRIGCON.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                                     |
| ---------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12        | 4         | Codice univoco di scaricamento della prima nota |

> **Nota**: È il codice univoco di scaricamento della prima nota a cui fanno riferimento i righi Contabili.

| Campo                       | Tipo | Lunghezza | Posizione | Descrizione             |
| --------------------------- | ---- | --------- | --------- | ----------------------- |
| **PROGRESSIVO NUMERO RIGO** | N    | 3         | 16        | Progressivo numero rigo |

> **Nota**: Da utilizzare solamente per movimenti relativi agli Studi di Settore e per quelli analitici.

| Campo          | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------- | ---- | --------- | --------- | ---------------------- |
| **TIPO CONTO** | A    | 1         | 19        | Tipo conto             |
|                |      |           |           | • (vuoto) = Sottoconto |
|                |      |           |           | • C = Cliente          |
|                |      |           |           | • F = Fornitore        |

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                         |
| --------------------------------------- | ---- | --------- | --------- | ----------------------------------- |
| **CLIENTE/FORNITORE CODICE FISCALE**    | A    | 16        | 20        | Codice fiscale cliente/fornitore    |
| **CLIENTE/FORNITORE SUBCODICE FISCALE** | A    | 1         | 36        | Subcodice fiscale cliente/fornitore |
| **CLIENTE/FORNITORE SIGLA**             | A    | 12        | 37        | Sigla cliente/fornitore             |

> **Nota**: L'identificazione del cliente/fornitore può essere effettuata o per codice fiscale (con eventuale subcodice) o per sigla. La preminenza viene comunque data al codice fiscale.

> **Nota**: I dati del cliente/fornitore non vengono considerati se Tipo Conto ≠ Cliente o Fornitore.

| Campo     | Tipo | Lunghezza | Posizione | Descrizione  |
| --------- | ---- | --------- | --------- | ------------ |
| **CONTO** | A    | 10        | 49        | Codice conto |

> **Nota**: Il codice conto non viene considerato se Tipo Conto = Cliente o Fornitore.

| Campo             | Tipo | Lunghezza | Posizione | Descrizione   |
| ----------------- | ---- | --------- | --------- | ------------- |
| **IMPORTO DARE**  | N    | 12        | 59        | Importo dare  |
| **IMPORTO AVERE** | N    | 12        | 71        | Importo avere |

> **Nota**: L'importo dare e l'importo avere sono alternativi quindi se è presente l'importo dare non viene portato l'importo avere.

| Campo    | Tipo | Lunghezza | Posizione | Descrizione |
| -------- | ---- | --------- | --------- | ----------- |
| **NOTE** | A    | 60        | 83        | Note        |

## Dati Competenza Contabile

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                            |
| --------------------------------------- | ---- | --------- | --------- | -------------------------------------- |
| **INS. DATI COMPETENZA CONTABILE(0/1)** | N    | 1         | 143       | Indicatore inserimento dati competenza |

> **Nota**: Indicare 1 se sono presenti le date di competenza e compilare i dati successivi.

| Campo                      | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------------------- | ---- | --------- | --------- | ---------------------- |
| **DATA INIZIO COMPETENZA** | N    | 8         | 144       | Data inizio competenza |
| **DATA FINE COMPETENZA**   | N    | 8         | 152       | Data fine competenza   |
| **NOTE DI COMPETENZA**     | A    | 60        | 160       | Note di competenza     |

## Campi Facoltativi

| Campo                               | Tipo | Lunghezza | Posizione | Descrizione                   |
| ----------------------------------- | ---- | --------- | --------- | ----------------------------- |
| **DATA REGISTRAZIONE APERTURA**     | N    | 8         | 220       | Data registrazione apertura   |
| **CONTO DA RILEVARE (MOVIMENTO 1)** | A    | 10        | 228       | Conto da rilevare movimento 1 |
| **CONTO DA RILEVARE (MOVIMENTO 2)** | A    | 10        | 238       | Conto da rilevare movimento 2 |

## Dati Movimenti Analitici

| Campo                                  | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **INS. DATI MOVIMENTI ANALITICI(0/1)** | N    | 1         | 248       | Indicatore inserimento dati movimenti analitici |

> **Nota**: Indicare 1 se sono presenti i centri di costo collegati alla prima nota e compilare i dati successivi e il file MOVANAC.TXT.

| Campo                      | Tipo | Lunghezza | Posizione | Descrizione            |
| -------------------------- | ---- | --------- | --------- | ---------------------- |
| **DATA INIZIO COMPETENZA** | N    | 8         | 249       | Data inizio competenza |
| **DATA FINE COMPETENZA**   | N    | 8         | 257       | Data fine competenza   |

## Dati Studi di Settore

| Campo                               | Tipo | Lunghezza | Posizione | Descrizione                               |
| ----------------------------------- | ---- | --------- | --------- | ----------------------------------------- |
| **INS. DATI STUDI DI SETTORE(0/1)** | N    | 1         | 265       | Indicatore inserimento dati studi settore |

> **Nota**: Indicare 1 se sono associati studi di settore alla prima nota e compilare i dati successivi e il file RIGSTUDI.TXT.

| Campo                     | Tipo | Lunghezza | Posizione | Descrizione           |
| ------------------------- | ---- | --------- | --------- | --------------------- |
| **STATO MOVIMENTO STUDI** | A    | 1         | 266       | Stato movimento studi |
|                           |      |           |           | • G = Generato        |
|                           |      |           |           | • M = Manuale         |

## **_ Fine Vecchio Tracciato _**

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                    |
| ---------------------------------- | ---- | --------- | --------- | ------------------------------ |
| **ESERCIZIO DI RILEVANZA FISCALE** | A    | 5         | 267       | Esercizio di rilevanza fiscale |

| Campo                                   | Tipo | Lunghezza | Posizione | Descrizione                         |
| --------------------------------------- | ---- | --------- | --------- | ----------------------------------- |
| **DETTAGLIO CLI/FOR CODICE FISCALE**    | A    | 16        | 272       | Codice fiscale dettaglio cli/for    |
| **DETTAGLIO CLI/FOR SUBCODICE FISCALE** | A    | 1         | 288       | Subcodice fiscale dettaglio cli/for |
| **DETTAGLIO CLI/FOR SIGLA**             | A    | 12        | 289       | Sigla dettaglio cli/for             |

> **Nota**: L'identificazione del dettaglio cli/for può essere effettuata o per codice fiscale (con eventuale subcodice) o per sigla. La preminenza viene comunque data al codice fiscale.

## ------------------------------------------

## Nuovo Tracciato da Release 9.9.3

## ------------------------------------------

| Campo           | Tipo | Lunghezza | Posizione | Descrizione |
| --------------- | ---- | --------- | --------- | ----------- |
| **SIGLA CONTO** | A    | 12        | 301       | Sigla conto |

> **Nota**: La sigla conto viene utilizzata per identificare il conto da inserire in prima nota quando non è stato indicato il CONTO (progressivo 49).

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 313       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato PNRIGCON.TXT_

```

File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/PNRIGIVA.md
```markdown
# PNRIGIVA.TXT - Tracciato Prima Nota Righe IVA

**Data**: 19/09/2012  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 173 Bytes + CRLF = 175 Bytes  
**Nome File**: PNRIGIVA.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                                     |
| ---------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12        | 4         | Codice univoco di scaricamento della prima nota |

> **Nota**: È il codice univoco di scaricamento della prima nota a cui fanno riferimento i righi IVA.

| Campo                       | Tipo | Lunghezza | Posizione | Descrizione             |
| --------------------------- | ---- | --------- | --------- | ----------------------- |
| **CODICE IVA**              | A    | 4         | 16        | Codice IVA              |
| **CONTROPARTITA**           | A    | 10        | 20        | Contropartita           |
| **IMPONIBILE**              | N    | 12        | 30        | Imponibile              |
| **IMPOSTA**                 | N    | 12        | 42        | Imposta                 |
| **IMPOSTA INTRATTENIMENTI** | N    | 12        | 54        | Imposta intrattenimenti |

> **Nota**: Il codice IVA deve essere presente in tabella codici IVA.

| Campo                                      | Tipo | Lunghezza | Posizione | Descrizione                                  |
| ------------------------------------------ | ---- | --------- | --------- | -------------------------------------------- |
| **IMPONIBILE 50% CORRISPETTIVI NON CONS.** | N    | 12        | 66        | Imponibile 50% corrispettivi non considerato |

> **Nota**: Va specificato quando sul codice IVA è presente la barratura di "Imponibile 50% dei corrispettivi" normalmente è uguale all'imponibile tranne quando l'imponibile iniziale non è divisibile per 2 e quindi ci sarà una differenza di 1 centesimo.

| Campo                       | Tipo | Lunghezza | Posizione | Descrizione             |
| --------------------------- | ---- | --------- | --------- | ----------------------- |
| **IMPOSTA NON CONSIDERATA** | N    | 12        | 78        | Imposta non considerata |

> **Nota**: Va specificato quando sul codice IVA è presente la barratura di "Imponibile 50% dei corrispettivi" e contiene l'eventuale differenza fra imposta + imposta intrattenimenti calcolate sull'imponibile originale Imposta + imposta intrattenimenti calcolato sul 50% dell'importo dimezzato.

> **N.B. La somma dei campi:**
>
> - Imponibile
> - Imponibile 50% corr. non cons.
> - Imposta
> - Imposta Intrattenimenti
> - Imposta non considerata
>
> **deve corrispondere all'importo lordo del rigo IVA.**

| Campo             | Tipo | Lunghezza | Posizione | Descrizione   |
| ----------------- | ---- | --------- | --------- | ------------- |
| **IMPORTO LORDO** | N    | 12        | 90        | Importo lordo |

> **Nota**: Questo importo è da utilizzare in alternativa agli importi precedenti qualora si desideri far effettuare tutti i calcoli alla procedura.

| Campo    | Tipo | Lunghezza | Posizione | Descrizione |
| -------- | ---- | --------- | --------- | ----------- |
| **NOTE** | A    | 60        | 102       | Note        |

## ------------------------------------------

## Nuovo Tracciato da Release 9.9.3

## ------------------------------------------

| Campo                   | Tipo | Lunghezza | Posizione | Descrizione         |
| ----------------------- | ---- | --------- | --------- | ------------------- |
| **SIGLA CONTROPARTITA** | A    | 12        | 162       | Sigla contropartita |

> **Nota**: La sigla conto viene utilizzata per identificare il conto da inserire in prima nota quando non è stata indicata la CONTROPARTITA (progressivo 20).

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 174       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato PNRIGIVA.TXT_

```

File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/CODPAGAM.md
```markdown
# CODPAGAM.TXT - Tracciato Condizioni di Pagamento

**Data**: 19/12/2005  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 68 Bytes + CRLF = 70 Bytes  
**Nome File**: CODPAGAM.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                       | Tipo | Lunghezza | Posizione | Descrizione                |
| --------------------------- | ---- | --------- | --------- | -------------------------- |
| **TABELLA ITALSTUDIO**      | A    | 1         | 4         | Campo riservato Italstudio |
| **CODICE PAGAMENTO**        | A    | 8         | 5         | Codice pagamento           |
| **DESCRIZIONE**             | A    | 40        | 13        | Descrizione                |
| **CONTO INCASSO/PAGAMENTO** | A    | 10        | 53        | Conto incasso/pagamento    |

> **Nota**: Campo riservato Italstudio - non indicare nulla.

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                        |
| ---------------------------------- | ---- | --------- | --------- | ---------------------------------- |
| **CALCOLA CON GIORNI COMMERCIALI** | A    | 1         | 63        | Calcola con giorni commerciali (X) |
| **CONSIDERA PERIODI DI CHIUSURA**  | A    | 1         | 64        | Considera periodi di chiusura (X)  |

| Campo            | Tipo | Lunghezza | Posizione | Descrizione             |
| ---------------- | ---- | --------- | --------- | ----------------------- |
| **SUDDIVISIONE** | A    | 1         | 65        | Suddivisione            |
|                  |      |           |           | • D = Dettaglio importi |
|                  |      |           |           | • T = Totale documento  |

| Campo               | Tipo | Lunghezza | Posizione | Descrizione              |
| ------------------- | ---- | --------- | --------- | ------------------------ |
| **INIZIO SCADENZA** | A    | 1         | 66        | Inizio scadenza          |
|                     |      |           |           | • D = Data documento     |
|                     |      |           |           | • F = Fine Mese          |
|                     |      |           |           | • R = Data registrazione |
|                     |      |           |           | • P = Data registro IVA  |
|                     |      |           |           | • N = Non determinata    |

| Campo           | Tipo | Lunghezza | Posizione | Descrizione |
| --------------- | ---- | --------- | --------- | ----------- |
| **NUMERO RATE** | N    | 2         | 67        | Numero rate |

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 69        | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato CODPAGAM.TXT_

```

File: //wsl.localhost/Ubuntu-24.04/home/davide/progetti/01-Personali/commessa-control-hub-v1/.docs/dati_cliente/tracciati/modificati/MOVANAC.md
```markdown
# MOVANAC.TXT - Tracciato Movimenti Analitici

**Data**: 19/12/2005  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 34 Bytes + CRLF = 36 Bytes  
**Nome File**: MOVANAC.TXT

## Struttura del Tracciato

| Campo      | Tipo | Lunghezza | Posizione | Descrizione   |
| ---------- | ---- | --------- | --------- | ------------- |
| **FILLER** | A    | 3         | 1         | Dati Generali |

## Dati Generali

| Campo                              | Tipo | Lunghezza | Posizione | Descrizione                                     |
| ---------------------------------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CODICE UNIVOCO DI SCARICAMENTO** | A    | 12        | 4         | Codice univoco di scaricamento della prima nota |

> **Nota**: È il codice univoco di scaricamento della prima nota a cui sono associati i centri di costo.

| Campo                                 | Tipo | Lunghezza | Posizione | Descrizione                              |
| ------------------------------------- | ---- | --------- | --------- | ---------------------------------------- |
| **PROGRESSIVO NUMERO RIGO CONTABILE** | N    | 3         | 16        | Numero di riferimento del rigo contabile |

> **Nota**: È il numero di riferimento del rigo contabile al quale associare i centri relativi ai movimenti analitici.

| Campo               | Tipo | Lunghezza | Posizione | Descrizione     |
| ------------------- | ---- | --------- | --------- | --------------- |
| **CENTRO DI COSTO** | A    | 4         | 19        | Centro di costo |
| **PARAMETRO**       | N    | 12        | 23        | Parametro       |

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 35        | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato MOVANAC.TXT_

```

</file_contents>
