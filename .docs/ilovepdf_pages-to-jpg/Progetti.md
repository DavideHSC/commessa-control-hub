# OSITALIA SOFTWARE SOLUTIONS

## SCHEDA OPERATIVA

**Area:** Magazzino - Progetti/commesse  
**Titolo:** Applicazione modulo progetti/commesse in azienda edile  
**Applicazione:** OS1 5.4  
**Revisione:** 3  
**Del:** 20 Maggio 2021  
**Contenuto:** Analisi ed esempi pratici dell'utilizzo di progetti/commesse all'interno della gestione di OS1: simulazione di una gestione tipo per un'azienda operante nel settore dell'edilizia.

## Introduzione

Il modulo "Progetti" consente all'azienda di gestire la valorizzazione dei progetti, attraverso l'integrazione con i moduli del ciclo attivo, del ciclo passivo, con la prima nota di magazzino e quella contabile. Oltre a questo è possibile inserire manualmente movimenti relativi sia a progetti che a manodopera, per questi ultimi è possibile effettuare la fatturazione in fase di generazione fatture da D.d.t..

Il modulo è estremamente configurabile, ha un'ampia serie di parametri che opportunamente impostati consentono di operare in maniera differente in base alla tipologia di azienda; grazie a questa flessibilità il modulo si può rivolgere a più settori di attività, in particolare vedremo la configurazione del modulo per quanto riguarda un'azienda di forniture e di installazione di materiale elettrico ed un'azienda del settore edile con la gestione dei cantieri.

## Modalità operative - Azienda edile

### Progetto

Il codice progetto è un codice alfanumerico di 15 caratteri, che può essere raggruppato e aggregato per macro-categorie tramite il gruppo. Nel nostro caso inseriamo il progetto relativo ad un quadro elettrico per il Comune di Prato.

In fase d'inserimento di un progetto è possibile attribuire l'anno e il numero progressivo del progetto, abilitando l'apposito flag presente nella configurazione del modulo stesso.

Per ogni progetto è presente la data di apertura (creazione) e le date di inizio e di fine lavori, la data stimata di consegna prevista e la data di consegna effettiva, che verrà aggiornata in fase di chiusura del progetto.

Ogni progetto deve essere intestato ad un cliente principale (nel nostro caso è assegnato al comune di Prato); per ogni progetto, in caso di produzione, è possibile indicare il prodotto e il numero di pezzi che devono essere prodotti.

Nel tipo progetto deve essere indicato se i singoli interventi sono da fatturare o se il progetto è sotto contratto di manutenzione, in questo caso i singoli interventi non dovranno essere fatturati.

La linguetta "Articoli", presente se abilitato l'apposito flag presente nella configurazione del modulo stesso, contiene l'elenco degli articoli che potranno essere movimentati per il progetto, se l'elenco è vuoto si possono movimentare tutti gli articoli.

Nella linguetta "Documenti" viene visualizzato l'elenco di tutti i documenti già assegnati al progetto. Tramite il bottone si accede direttamente al programma di associazione progetti/documenti. In fase di associazione è possibile visualizzare tutti i documenti, ma per i documenti che incrementano costi o ricavi per cui l'utente non è abilitato, tramite l'apposito parametro "Vis.prezzi progetti" presente in Opzioni di Xconfig, non sarà possibile visualizzare prezzi e importi.

Nella linguetta "Valori" sono visualizzati i valori progressivi del progetto. In questa maschera potranno essere visualizzati solo i costi, solo i ricavi o nessun valore in base al parametro di configurazione "Vis.prezzi progetti" presente in Opzioni di XConfig.

Nella parte alta vi è un campo che indica la data dell'ultimo aggiornamento seguito dal bottone "Aggiorna" che esegue il calcolo e l'aggiornamento dei valori del progetto corrente.

La sezione è poi suddivisa in tre parti:

• i COSTI suddivisi per tipo di movimento ( Materiali, Manodopera, Vari, Lavorazioni ) e per tipo di costo ( Preventivo, Consuntivo, Previsto ) e lo Scostamento (calcolato come rapporto fra i costi consuntivi aumentati dei previsti e i costi preventivi).

• i RICAVI suddivisi con gli stessi criteri utilizzati per la parte relativa ai costi.

• il riepilogo generale costi e ricavi con relativo saldo.

I Costi e Ricavi sono suddivisi in quattro aree/attività e sono stati distinti in:

• Materiali
• Manodopera  
• Varie
• Lavorazioni

La definizione delle voci, che vengono visualizzate in tutta la procedura, deve essere effettuata nella configurazione del modulo.

Le etichette determinano il tipo di dicitura da riportare nelle varie voci, le diciture impostate vengono visualizzate in tutta la procedura, nel nostro esempio la manodopera viene visualizzata come etichetta "Interventi".

Questi elementi si integrano a livello di anagrafica articoli, come spiegato nell'apposito paragrafo.

Nella linguetta "Grafici" verranno visualizzati i grafici relativi ai valori progressivi del progetto.

Nella gestione del cantiere che stiamo impostando può esserci la necessita di gestire una movimentazione di magazzino per il progetto, questo può essere eseguito tramite la gestione dei saldi progetti, attivabile tramite il flag presente nella configurazione. Nell'anagrafica del progetto viene visualizzata la linguetta "Saldi" in cui verranno mostrati i saldi dei prodotti movimentati sul progetto. I progetti possono essere movimentati su un magazzino generico o su un magazzino specifico per cantiere, nel nostro esempio inseriamo un codice magazzino specifico.

### Articoli

Nell'anagrafica articoli la gestione dei progetti si integra tramite il tipo articolo, in cui è possibile indicare oltre alle tipologie di prodotto vero e proprio, come le materie prime, i semilavorati, i prodotti finiti e i prodotti in lavorazione, anche la manodopera, nel nostro caso etichettata "interventi", le lavorazioni e le varie.

I valori sui progetti vengono quindi movimentati in base a quanto impostato in anagrafica articoli sul campo "Tipo articolo". Vediamo nello specifico quali colonne dei valori vengono aggiornate in base al tipo articolo:

| Colonna valori | Tipo articolo |
|----------------|---------------|
| Materiali | Materia Prima, Semilavorato, Prodotto finito, In lavorazione |
| Manodopera | Manodopera |
| Varie | Prestazioni/servizio, Varie |
| Lavorazioni | Lavorazioni |

Vediamo adesso come vengono valorizzati i campi dei valori, tramite la registrazione dei seguenti documenti:

• Emissione offerta
• Emissione documento di trasferimento materiali con aggiornamento costi consuntivi materiali da magazzino
• Registrazione reso materiali in magazzino con aggiornamento costi consuntivi
• Registrazione costi vari da prima nota contabile
• Fatturazione a corpo

#### Emissione offerta

I valori preventivi vengono alimentati dalla gestione delle offerte clienti oppure dalla movimentazione manuale della gestione progetti.

I ricavi preventivi vengono aggiornati in base al valore delle offerte, al netto degli sconti, mentre i costi vengono valorizzati sempre dalle offerte ma con il valore definito negli appositi campi della configurazione progetti:

Per poter gestire i costi ed i ricavi consuntivi è quindi necessario inserire un'offerta intestata al cliente anche per poter effettuare un prospettivo di spese per il lavoro che dovrà essere effettuato. In alternativa all'emissione dell'offerta è possibile inserire due movimenti progetti, uno per i costi e uno per i ricavi consuntivi, per poter gestire tali valori.

Nel nostro esempio andiamo ad emettere due offerte:

• la prima offerta è ad uso interno, intestata al cliente e assegnata al progetto, tale offerta è dettagliata per poter effettuare la stima e il calcolo dei valori, le righe del documento le assegneremo ad un tipo rigo apposito che non prevede l'esportazione dei dati negli altri documenti, il tipo rigo che utilizzeremo è così configurato:

• la seconda offerta sempre intestata al cliente, emessa a corpo e assegnata al progetto, tale offerta sarà poi evasa emettendo l'ordine

Sui documenti è possibile gestire i progetti a livello di testa o a livello di rigo, indicando quindi il progetto su ogni rigo documento, questo viene abilitato tramite il flag presente nella configurazione del modulo.

Nel nostro esempio abbiamo abilitato la gestione dei progetti sulla testa del documento.

Inseriamo la prima offerta intestandola al Comune di Prato e nei dati di testa impostiamo il progetto a cui assegnare tutta l'offerta.

L'offerta interna viene inserita con un'apposita causale gestita su una serie documento utilizzata per la sola tipologia di offerte e che ha al suo interno la proposta del tipo rigo che abbiamo configurato sopra.

Nel corpo del documento inseriamo sia i materiali che le ore di manodopera per effettuare il lavoro.

Sull'offerta viene proposto il prezzo del listino assegnato al Comune di Prato, che verrà utilizzato per calcolare il valore dei ricavi preventivi dei materiali.

Confermiamo l'offerta e aggiorniamo i valori sul progetto.

Come possiamo vedere i ricavi materiali vengono aggiornati con il valore dell'offerta, mentre i costi materiali vengono aggiornati con il valore del listino "COS", sia per i materiali che la manodopera, come configurato.

Sempre dall'anagrafica progetti possiamo vedere che l'offerta è stata assegnata al progetto, dalla linguetta "Documenti". Con il doppio click sul documento selezionato è possibile accedere alla manutenzione del documento stesso.

I documenti possono essere quindi associati dalla gestione dei documenti stessi o tramite la funzione di Associazione tramite il bottone.

Per vedere come utilizzare il programma di associazione eliminiamo il progetto dall'offerta e attiviamo la procedura cliccando sullo specifico bottone.

Accedendo al programma vengono richiesti i parametri di selezione dei documenti intestati al cliente assegnato nel caso in cui venga selezionato un tipo documento del ciclo attivo, a fornitori o a tutti, in base al tipo selezionato.

Nel nostro esempio impostiamo la selezione delle offerte emesse per il Comune di Prato.

Nella griglia in alto viene visualizzata la testa dell'offerta emessa, nella griglia sotto vengono visualizzate le righe del documento.

Nel caso in cui sia stata attivata la gestione dei progetti sulla testa del documento è possibile assegnare tutto il documento al progetto corrente selezionandolo nella prima griglia, altrimenti sarà possibile selezionare nella griglia sotto le singole righe per assegnarle al progetto corrente. Tramite i tasti funzione o il tasto destro del mouse è possibile selezionare o deselezionare uno o tutti i documenti.

Nel nostro caso selezionando l'offerta e salvando l'associazione otteniamo lo stesso risultato che avevamo ottenuto tramite l'assegnazione del progetto all'interno del documento.

Emettiamo adesso la seconda offerta con indicazione dell'importo totale del lavoro per poterla inviare al cliente ed assegnandola al progetto.

Come possiamo vedere dal progetto stesso l'offerta viene visualizzata come documento assegnato al progetto, ma non effettua nessun aggiornamento sui valori del progetto, che sono rimasti inalterati.

#### Emissione documento di trasferimento materiali con aggiornamento costi consuntivi materiali da magazzino

Andiamo adesso a registrare un Ddt di trasferimento materiali, dal movimento di magazzino aggiorniamo i costi consuntivi dei materiali, generati con le apposite causali di magazzino.

Il magazzino aggiorna i costi consuntivi materiali, come impostato in configurazione nel campo.

Nel nostro esempio andiamo ad inserire il documento di spedizione intestato al Comune di Prato per i materiali da inviare con un'apposita causale di spedizione che movimenta il magazzino, come spiegato successivamente.

La causale di trasferimento movimenta il magazzino di destinazione 20, che abbiamo precedentemente inserito, e con la causale di magazzino 331.

La causale di magazzino 331 è una causale di scarico che movimenta il progetto, non aggiornando nessun valore, e che movimenta in contropartita la causale 332.

La causale di magazzino 332 è la causale automatica di carico che movimenta il progetto e incrementa i costi consuntivi dei materiali al prezzo del listino "COS", come indicato nella causale stessa.

Nel corpo del documento devono essere inseriti tutti i materiali che devono essere trasferiti al magazzino 20.

Aggiornando i valori sul progetto vediamo che viene aggiornato il valore dei costi consuntivi materiali.

Avendo gestito anche i saldi dei progetti nella sezione saldi vengono visualizzati le giacenze dei prodotti movimentati sul progetto, questi dati vengono aggiornati automaticamente ogni volta che viene registrato un movimento di magazzino che contiene il progetto e il prodotto.

#### Registrazione reso materiali in magazzino con aggiornamento costi consuntivi

Andiamo adesso a registrare un movimento di reso di materiali, dai movimenti di magazzino aggiornando sia i costi consuntivi dei materiali che i saldi dei prodotti del progetto.

La causale di magazzino che utilizzeremo per registrare il reso è la 333, è una causale di scarico che movimenta il progetto decrementando i costi consuntivi materiali al valore del listino "COS" e che movimenta in contropartita la causale 334.

La causale di magazzino 334 è la causale automatica di carico che movimenta il progetto, ma non aggiorna nessun valore.

Inseriamo adesso il movimenti di magazzino, scaricando il magazzino 20 e caricando il magazzino, ed assegnando il movimento al progetto.

Nel dettaglio del movimento andiamo ad indicare i materiali e le quantità rese.

Aggiornando i valori sul progetto vediamo che viene decrementato il valore dei costi consuntivi materiali, in base ai materiali resi valorizzati al listino "COS" come indicato sulla causale.

Risultando aggiornati anche i saldi dei progetti, in cui possiamo vedere che sui prodotti rientrati è stato registrato uno scarico.

#### Registrazione costi vari da prima nota contabile

Passiamo adesso a vedere come registrare i movimenti relativi a costi vari come ad esempio gli stipendi del mese di ottobre che vengono registrati direttamente dalla prima nota contabile.

Per attivare la gestione dei progetti dalla prima nota contabile è necessario:

• attivare il flag presente nella configurazione del modulo
• attivare il flag sulle causali contabili
• attivare il flag sui sottoconti

Movimentando e confermando l'importo contabile sul conto che abbiamo abilitato alla gestione viene aperta la maschera dei movimenti progetti, in cui inseriamo il progetto che vogliamo movimentare ed indichiamo sia il tipo valore che il tipo voce dei valori che vogliamo aggiornare sul progetto.

Il movimento può essere inserito senza indicare nessuna voce, come nel nostro esempio in cui abbiamo indicato solo la descrizione, oppure può essere inserito indicando una voce specifica, codificata nell'anagrafica degli articoli con tipo articolo uguale a prestazione/servizio o costi vari.

Il movimento inserito viene registrato nei Movimenti progetti per cui è possibile manutenerlo sia direttamente dalla prima nota contabile, che dall'apposito programma di manutenzione movimenti progetti.

Aggiornando i valori progetti vediamo che il costo consuntivo della manodopera è stato incrementato del valore del movimento inserito.

#### Fatturazione lavoro a corpo

Andiamo adesso ad emettere la fattura evadendo l'offerta emessa.

Dopo aver selezionato l'offerta nella fattura viene automaticamente assegnato il progetto.

Nel progetto possiamo vedere, nella linguetta "Documenti", che sia la fattura che tutti i documenti e le registrazioni effettuate sono state associate al progetto.

Il totale fatturato per progetto viene aggiornato, sempre tramite l'apposito bottone, nel campo "Fatturato".

Con i valori aggiornati passiamo a vedere i grafici relativi ai progressivi del progetto, tramite il pulsante è possibile alternare la visualizzazione del grafico in tre o due dimensioni.

Sono visualizzabili tre tipologie di grafico, come vedremo di seguito.

• Il grafico Generale riporta la comparazione dei valori del progetto per tipo di valore, quindi preventivo, consuntivo e previsto, raffrontando il totale dei costi e dei ricavi.

• Il grafico Dettaglio riporta la comparazione dei valori del dettaglio dei costi o dei ricavi, del progetto, in base a quale pulsante (presente sulla destra) è stato selezionato per classe di valore, nel nostro caso per i materiali, gli interventi e le varie, raffrontandole per tipologia di valore.

• Il grafico Composizione riporta la comparazione della composizione dei costi o dei ricavi, in base a quale pulsante (presente sulla destra) è stato selezionato, per tipo valore ed espresse in percentuale sul totale della tipologia.
