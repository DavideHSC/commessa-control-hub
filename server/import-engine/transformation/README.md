# Transformation Layer

Questo è il secondo livello, il cuore della logica di business. Riceve dati tipizzati e validati dal livello di acquisizione e li trasforma in modelli pronti per essere salvati nel database.

Le funzioni in questo layer devono essere **pure**, ovvero senza effetti collaterali (side-effects) e facilmente testabili.

- **transformers**: Contiene i servizi di trasformazione, dove risiede la logica di business.
- **decoders**: Contiene le funzioni evolute per decodificare i valori legacy.
- **mappers**: Contiene la logica per mappare gli oggetti trasformati ai modelli di Prisma (`Prisma.ModelCreateInput`). 