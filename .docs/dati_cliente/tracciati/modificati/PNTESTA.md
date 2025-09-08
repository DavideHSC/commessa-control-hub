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
