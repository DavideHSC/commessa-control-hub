Sei un architetto software senior e un esperto di analisi di codebase. Il tuo compito è aiutarmi a capire la struttura e la qualità del mio progetto.
Ti sto fornendo un file dependency-report.json generato dallo strumento dependency-cruiser. Questo file contiene un'analisi completa delle dipendenze tra tutti i file JavaScript e TypeScript del mio progetto.
Il mio obiettivo è identificare potenziali problemi architetturali, capire i flussi di dati principali e trovare aree che potrebbero beneficiare di un refactoring.
Basandoti esclusivamente sul contenuto di questo file JSON, rispondi alle seguenti domande:
[Qui inserisci le tue domande specifiche. Vedi esempi sotto]

Esempi di Domande Specifiche da Porre
Una volta incollato il modello di prompt, ecco alcune domande potentissime che puoi fare (una alla volta o tutte insieme):
Per una Visione d'Insieme:
"Quali sono i 5 file più 'centrali' del progetto (cioè quelli con il maggior numero di dipendenze entranti e uscenti)? Cosa potrebbe significare questo?"
"C'è qualche file che sembra essere isolato o non utilizzato da nessun altro modulo?"
"Raggruppa i file in moduli logici basandoti sulle loro interconnessioni (es. 'Modulo UI', 'Modulo API', 'Modulo Importazione')."
Per l'Analisi della Qualità del Codice:
"Ci sono dipendenze circolari? Se sì, elencale e spiega perché sono un problema." (Questa è una delle analisi più preziose).
"Identifica eventuali violazioni dell'architettura. Ad esempio, un componente della UI (src/components/...) sta importando direttamente qualcosa dal database (server/lib/...)?"
"Il file server/routes/v2/import.ts sembra molto connesso. Puoi descrivere le sue responsabilità principali basandoti solo sui moduli che importa?"
"Analizza le dipendenze della cartella server/import-engine. Sembra seguire una struttura a layer (Acquisition -> Transformation -> Persistence) come descritto nei suoi file README?"
Per il Refactoring e la Manutenzione:
"Se volessi modificare il file prisma/schema.prisma, quali file sarebbero più probabilmente impattati da questa modifica?"
"Voglio separare la logica di business dalla UI. Quali file in src/pages hanno troppe dipendenze dirette a file in src/api?"