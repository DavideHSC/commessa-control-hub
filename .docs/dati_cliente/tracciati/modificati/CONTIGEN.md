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
