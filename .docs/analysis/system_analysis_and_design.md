
# Analisi e Design del Sistema di Importazione Dati

**Data:** 29 giugno 2025
**Autori:** Gemini AI

## 1. Introduzione e Obiettivo

Questo documento riassume l'analisi completa del sistema di importazione dati dell'applicazione "Commessa Control Hub". L'obiettivo è consolidare tutte le scoperte fatte durante l'analisi dei tracciati dei file, delle relazioni tra i dati, dello schema del database e della logica dei parser esistenti.

Questo file funge da **fonte di verità condivisa** e memoria delle nostre riflessioni strategiche, guidando le decisioni future di sviluppo e manutenzione.

## 2. Analisi dei Tracciati Dati

Sono stati analizzati 6 tipi principali di documenti di tracciato, che corrispondono ai parser implementati nell'applicazione. Ogni tracciato descrive un file a larghezza fissa (`.txt`) proveniente da un sistema contabile legacy.

### 2.1. Riepilogo dei Tracciati

*   **`A_CLIFOR.md` (Anagrafica Clienti/Fornitori):**
    *   **Scopo:** Definisce le anagrafiche complete dei soggetti (clienti, fornitori, entrambi).
    *   **Caratteristiche:** Contiene dati anagrafici, fiscali (CF, P.IVA) e contabili (sottoconti, condizioni di pagamento). Gestisce la distinzione tra persone fisiche e giuridiche.
    *   **Chiave Primaria:** `CODICE FISCALE` + `SUBCODICE`.

*   **`CAUSALI.md` (Causali Contabili):**
    *   **Scopo:** Definisce le regole di comportamento per ogni tipo di transazione (es. Fattura Acquisto, Pagamento).
    *   **Caratteristiche:** Funge da "motore" per l'automazione, pre-impostando la gestione IVA, le partite, le ritenute, ecc.
    *   **Chiave Primaria:** `CODICE CAUSALE`.

*   **`CODPAGAM.md` (Condizioni di Pagamento):**
    *   **Scopo:** Definisce le modalità per la generazione delle scadenze di pagamento e incasso.
    *   **Caratteristiche:** Alimenta lo scadenzario attivo e passivo, specificando numero di rate, decorrenza, ecc.
    *   **Chiave Primaria:** `CODICE PAGAMENTO`.

*   **`CONTIGEN.md` (Piano dei Conti):**
    *   **Scopo:** Rappresenta la struttura gerarchica (Mastri, Conti, Sottoconti) di tutta la contabilità.
    *   **Caratteristiche:** È il "vocabolario" centrale del sistema, a cui quasi tutti gli altri dati si collegano. Contiene anche i raccordi per le dichiarazioni fiscali.
    *   **Chiave Primaria:** `CODIFICA`.

*   **`CODICIVA.md` (Codici IVA):**
    *   **Scopo:** Descrive le aliquote, le esenzioni e le regole fiscali per l'IVA.
    *   **Stato:** Il file di analisi era vuoto, ma la sua esistenza implica la necessità di un parser dedicato.

*   **`movimenti_contabili.md` (Movimenti Contabili):**
    *   **Scopo:** Documento aggregato che descrive come un gruppo di 4 file (`PNTESTA.TXT`, `PNRIGCON.TXT`, `PNRIGIVA.TXT`, `MOVANAC.TXT`) rappresenti un'unica, completa registrazione contabile.
    *   **Relazione Chiave:** Il `CODICE UNIVOCO DI SCARICAMENTO` lega gerarchicamente la testata alle sue righe contabili, righe IVA e dettagli analitici.

## 3. Analisi delle Relazioni tra i Dati

L'analisi ha rivelato una struttura dati relazionale classica e robusta.

*   **Tabelle "Master":** `CONTIGEN`, `A_CLIFOR`, `CAUSALI`, `CODPAGAM`, `CODICIVA` definiscono le entità e le regole.
*   **Tabelle "Transazionali":** `PNTESTA`, `PNRIGCON`, `PNRIGIVA`, `MOVANAC` registrano le operazioni che utilizzano le entità e le regole definite nei master.
*   **Logica di Collegamento Anagrafica-Movimenti:** È stata identificata una logica di business cruciale per collegare i movimenti ai clienti/fornitori, con una chiara gerarchia:
    1.  **Metodo Primario:** Utilizzare il `CODICE FISCALE`.
    2.  **Metodo Secondario (Fallback):** Utilizzare la `SIGLA` / `CODICE ANAGRAFICA` se il codice fiscale non è disponibile o non trova corrispondenza.

## 4. Analisi dello Schema Database (`prisma/schema.prisma`) e dei Parser

L'analisi combinata dello schema e del codice dei parser ha fornito le seguenti informazioni.

### 4.1. Punti di Forza

*   **Coerenza Schema-Dati:** I modelli Prisma (`Conto`, `Cliente`, `Fornitore`, etc.) sono ben allineati con i campi definiti nei tracciati.
*   **Architettura Modulare:** La logica di importazione è suddivisa in gestori specifici per ogni template, rendendo il codice pulito e manutenibile.
*   **Workflow Dedicato:** La creazione di un workflow separato per l'importazione complessa delle anagrafiche (`anagrafica_clifor`) è una scelta architetturale eccellente.
*   **Astrazione del Parsing:** L'uso di una funzione generica `parseFixedWidth` centralizza la logica di parsing a larghezza fissa.

### 4.2. Aree di Interesse e Osservazioni

*   **Relazioni Opzionali:** Molte chiavi esterne nello schema sono opzionali (`String?`). Questo offre flessibilità ma potrebbe non imporre la stretta integrità referenziale suggerita dai documenti di analisi. È una scelta di design da tenere presente.
*   **Indici Database:** Manca un uso estensivo di indici espliciti (`@@index`). Per garantire performance su larga scala, i campi usati frequentemente per le ricerche (es. `externalId`, `codiceFiscale`) dovrebbero essere indicizzati.
*   **Supporto Logica di Business:** Lo schema attuale **supporta** correttamente la logica di fallback "Codice Fiscale/Sigla" avendo entrambi i campi (`codiceFiscale` e `codiceAnagrafica`) disponibili nei modelli.

## 5. Conclusioni e Prossimi Passi

Il sistema di importazione è **ben architettato e largamente coerente** con le specifiche dei dati di origine. I parser hanno dimostrato di funzionare correttamente durante i test, e lo schema del database è adeguato a contenere i dati importati.

Le analisi hanno evidenziato che, sebbene i test funzionali abbiano avuto successo, una revisione dello schema per rafforzare le relazioni (rendendo obbligatori alcuni campi) e per aggiungere indici potrebbe migliorare ulteriormente la robustezza e le performance del sistema a lungo termine.

Questo documento verrà mantenuto come riferimento per tutte le future attività di sviluppo e manutenzione sulla piattaforma di importazione.
