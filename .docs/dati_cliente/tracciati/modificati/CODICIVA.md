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
