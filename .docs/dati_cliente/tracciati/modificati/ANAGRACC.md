# ANAGRACC.TXT - Tracciato Anagrafica Account

**Data**: 19/12/2005  
**File**: Sequenziale a lunghezza fissa  
**Dimensione**: 156 Bytes + CRLF = 158 Bytes  
**Nome File**: ANAGRACC.TXT

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

| Campo            | Tipo | Lunghezza | Posizione | Descrizione  |
| ---------------- | ---- | --------- | --------- | ------------ |
| **CODICE**       | A    | 4         | 21        | Codice       |
| **DESCRIZIONE**  | A    | 40        | 25        | Descrizione  |
| **RESPONSABILE** | A    | 40        | 65        | Responsabile |
| **LIVELLO**      | N    | 2         | 105       | Livello      |
| **NOTE**         | A    | 50        | 107       | Note         |

## Campo di Chiusura

| Campo    | Tipo | Lunghezza | Posizione | Descrizione                                     |
| -------- | ---- | --------- | --------- | ----------------------------------------------- |
| **CRLF** | E    | 2         | 157       | Campo chiusura record (codici esadecimali 0D0A) |

> **Nota**: Questo campo è impostato automaticamente se si tratta il file in oggetto in maniera sequenziale.

## Tipi di Campo

- **A** = Alfanumerico
- **N** = Numerico ASCII
- **E** = Campo chiusura record (codici esadecimali 0D0A)

---

_Documento generato automaticamente dal tracciato ANAGRACC.TXT_

### 📜 Analisi Funzionale del Tracciato ANAGRACC.TXT

_Questo documento illustra la funzione di ogni campo nel tracciato a lunghezza fissa `ANAGRACC.TXT`. Ogni record ha una dimensione totale di 156 byte, più i caratteri di fine riga._

---

#### **Intestazione e Dati Azienda**

- **FILLER** `(Pos: 1, Len: 3)`
  - **Funzione**: È uno spazio di riempimento. I primi tre caratteri di ogni riga sono riservati e non contengono dati utili ai fini dell'anagrafica. Servono per allineare i campi successivi o per mantenere la compatibilità con altri sistemi.
- **CODICE FISCALE AZIENDA** `(Pos: 4, Len: 16)`
  - **Funzione**: Contiene il codice fiscale (16 caratteri alfanumerici) dell'azienda a cui il record anagrafico appartiene.
- **SUBCODICE AZIENDA** `(Pos: 20, Len: 1)`
  - **Funzione**: È un identificativo aggiuntivo di un singolo carattere per distinguere una specifica unità o divisione all'interno della stessa azienda (es. una filiale, un reparto, ecc.).

---

#### **Corpo dell'Anagrafica**

- **CODICE** `(Pos: 21, Len: 4)`
  - **Funzione**: È l'identificativo univoco del record anagrafico stesso (es. codice cliente, codice fornitore). È il campo chiave che permette di trovare questo record specifico.
- **DESCRIZIONE** `(Pos: 25, Len: 40)`
  - **Funzione**: Contiene il nome o la descrizione estesa dell'anagrafica. Per una persona sarà "Nome Cognome", per un'azienda sarà la "Ragione Sociale".
- **RESPONSABILE** `(Pos: 65, Len: 40)`
  - **Funzione**: Memorizza il nome del contatto o della persona responsabile associata a questa anagrafica (es. il referente commerciale).
- **LIVELLO** `(Pos: 105, Len: 2)`
  - **Funzione**: È un campo numerico che classifica l'anagrafica. Definisce una categoria, una priorità o un raggruppamento (es. Livello 01 per "Clienti VIP").
- **NOTE** `(Pos: 107, Len: 50)`
  - **Funzione**: Un campo testuale libero destinato a contenere informazioni aggiuntive non strutturate relative all'anagrafica.

---

#### **Campo di Chiusura**

- **CRLF** `(Pos: 157, Len: 2)`
  - **Funzione**: Non è un dato, ma una sequenza di due caratteri di controllo (Carriage Return e Line Feed) che indicano la fine della riga e l'inizio di una nuova.
