# Protocollo Operativo per Modifiche al Codice

**Principio Guida:** Mai agire d'impulso. L'analisi del contesto precede sempre l'azione. Ogni modifica deve essere considerata nel suo impatto totale sul sistema.

---

## Fase 1: Analisi d'Impatto (Checklist Obbligatoria)

Prima di scrivere una riga di codice, è obbligatorio rispondere a queste domande per mappare l'intera area di impatto della modifica.

1.  **[ ] Obiettivo Finale:** Qual è il risultato esatto che l'utente si aspetta di vedere? Qual è il comportamento desiderato?

2.  **[ ] Punto di Ingresso:** Qual è il file o la funzione principale su cui intervenire?

3.  **[ ] Dipendenze a Valle (Frontend):**
    *   Quali componenti, pagine o hooks utilizzano i dati o la logica che sto per modificare?
    *   Come si comporteranno dopo la mia modifica? Prevedere possibili effetti collaterali.

4.  **[ ] Dipendenze a Monte (Backend):**
    *   Se modifico il frontend, l'API di backend che lo serve è allineata? Devo modificare anche l'endpoint?
    *   Se modifico il backend, quali chiamate frontend (e quindi quali componenti) si romperanno o cambieranno comportamento?

5.  **[ ] Contratto Dati (Tipi):**
    *   La mia modifica impatta una struttura dati condivisa (es. una risposta API, un oggetto di stato)?
    *   È necessario aggiornare le definizioni in `src/types/index.ts` per mantenere l'allineamento tra client e server? Questo è un punto critico per evitare errori di compilazione a cascata.

---

## Fase 2: Piano d'Azione Esplicito

Una volta completata l'analisi, formulare un piano chiaro e comunicarlo.

1.  **Lista degli Interventi:** Stilare una **lista completa di tutti i file** che verranno modificati.
2.  **Descrizione delle Modifiche:** Per ogni file, descrivere sinteticamente la modifica necessaria e il perché.
3.  **Comunicazione Preventiva:** **Comunicare questo piano all'utente *prima* di iniziare a modificare il codice.** Questo passaggio è cruciale e non negoziabile. Serve come validazione del ragionamento e previene lavori errati.

---

## Fase 3: Esecuzione Controllata e Verifica

Agire solo dopo l'approvazione (implicita o esplicita) del piano.

1.  **Esecuzione Mirata:** Eseguire le modifiche esattamente come pianificato. Evitare deviazioni non previste.
2.  **Verifica del Flusso:** Dopo l'applicazione, eseguire una **verifica mentale completa del flusso utente**, dall'inizio alla fine, per garantire la coerenza logica dell'esperienza. Simulare le azioni dell'utente e controllare che ogni schermata e ogni stato intermedio siano corretti. 