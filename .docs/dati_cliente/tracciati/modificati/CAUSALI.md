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
