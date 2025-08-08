# Command: analyze-project

Ho diversi file README.md che descrivono le varie parti del progetto. 
Leggili tutti a partire dal seguente path: $ARGUMENTS e procedi ricorsivamente in tutte le sottocartelle, lo sopo finale è quello di creare un riepilogo complessivo.

## Passi:

Nel tuo riepilogo, voglio che ti concentri su:
1.  **Architettura e Flusso dei Dati:** Come è strutturato il progetto? Da dove entrano i dati (es. file a larghezza fissa) e come vengono processati fino alle tabelle di produzione?
2.  **Componenti Core:** Qual è il loro ruolo specifico? (es. `fixedWidthParser`, `finalization_optimized`).
3.  **Evoluzione e Refactoring:** Basandoti sulla descrizione dei file (es. `finalization.ts` vs `finalization_optimized.ts`), evidenzia le principali ottimizzazioni e cambiamenti logici che sono stati implementati nel tempo.

Fornisci una visione d'insieme che mi aiuti a capire lo stato attuale e la logica evolutiva del progetto.