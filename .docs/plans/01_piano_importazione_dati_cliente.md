# Piano Operativo: Importazione e Configurazione Dati Cliente

Questo documento descrive i passaggi necessari per importare, mappare e configurare i dati del cliente all'interno dell'applicazione, basandosi sull'analisi del file `cliente-bilanci_centri_di_costo_ricavo.txt`.

L'obiettivo finale è avere un'istanza dell'applicazione pre-configurata con dati realistici, che permetta di testare il flusso di lavoro completo: `Setup -> Creazione Commessa -> Import Scritture -> Riconciliazione/Allocazione -> Controllo su Dashboard`.

---

## Struttura Dati Target

La struttura gerarchica che vogliamo rappresentare nel nostro sistema è la seguente:
- **Commesse**: I Comuni (es. Sorrento, Massa Lubrense).
- **Centri di Costo**: Le Attività all'interno di un Comune (es. Igiene Urbana - Sorrento, Verde Pubblico - Sorrento). Questi verranno gestiti come `Commessa` con una relazione padre-figlio.
- **Voci Analitiche**: Le macro-categorie di costo/ricavo (es. Costo del personale, Gestione automezzi).
- **Conti**: Il piano dei conti del cliente (es. `6005000850 CARBURANTI E LUBRIFICANTI`), mappato su una `VoceAnalitica`.

---

## Piano di Lavoro Dettagliato

### Task 1: Creazione e Popolamento delle Voci Analitiche

- **Obiettivo**: Popolare la tabella `VoceAnalitica` con le 14 categorie di spesa identificate.
- **Azione**:
    1. Creare un nuovo script di seed in `prisma/seed.ts` (o modificare l'esistente).
    2. Nello script, definire un array contenente le 14 voci analitiche estratte dal file di bilancio.
    3. Usare `prisma.voceAnalitica.createMany()` per inserire questi dati nel database.
    4. Eseguire il seed per popolare il DB.

### Task 2: Modifica Struttura per Gerarchia Commesse (Comuni -> Attività)

- **Obiettivo**: Permettere di creare una gerarchia tra Commesse per rappresentare la relazione `Comune -> Attività`.
- **Azione**:
    1. Modificare `prisma/schema.prisma` aggiungendo al modello `Commessa` una relazione a sé stesso per gestire la gerarchia (es. `parentId`).
    2. Creare e applicare una nuova migrazione del database per rendere effettiva la modifica.
    3. Aggiornare il client Prisma.

### Task 3: Creazione e Popolamento delle Commesse e Centri di Costo

- **Obiettivo**: Popolare la tabella `Commessa` con i Comuni (genitori) e le Attività (figli).
- **Azione**:
    1. Nello script di seed, per prima cosa, creare un `Cliente` generico (es. "PENISOLAVERDE SPA") a cui associare le commesse.
    2. Creare le `Commesse` principali (i Comuni: Sorrento, Piano di Sorrento, Massa Lubrense).
    3. Creare le `Commesse` secondarie (le Attività/Centri di Costo, es. "Igiene Urbana - Sorrento") e collegarle alla commessa genitore corretta tramite il campo `parentId`.
    4. Eseguire il seed.

### Task 4: Importazione e Mappatura del Piano dei Conti

- **Obiettivo**: Popolare la tabella `Conto` e collegare ogni conto alla sua `VoceAnalitica` di appartenenza.
- **Azione**:
    1. Questa è la parte più complessa. Richiede di parsare il file `cliente-bilanci_centri_di_costo_ricavo.txt`.
    2. Per ogni riga di costo/ricavo, è necessario estrarre:
        - Il codice del conto (es. `6005000850`).
        - La descrizione del conto (es. `CARBURANTI E LUBRIFICANTI`).
        - L'identificativo della categoria di spesa (es. `2` per "gestione automezzi").
    3. Nello script di seed, aggiungere la logica per:
        - Leggere e parsare i dati (potremmo creare un file JSON intermedio per semplificare).
        - Iterare su ogni conto.
        - Recuperare l'ID della `VoceAnalitica` corrispondente.
        - Creare il record `Conto` usando `prisma.conto.create()`, popolando il campo `voceAnaliticaId` con l'ID recuperato.
    4. Eseguire il seed aggiornato.

### Task 5: Sviluppo Interfaccia di Importazione (Futuro)

- **Obiettivo**: Creare una UI che permetta all'utente di caricare i file di bilancio e avviare il processo di importazione.
- **Descrizione**: Questo task verrà affrontato in futuro. Lo script di seed ci serve per validare la logica e avere dati di test. Una volta che la logica di importazione nello script di seed sarà solida, potrà essere estratta e riutilizzata nel backend per un'API richiamata dalla UI. 