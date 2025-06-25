# Acquisition Layer

Questo è il primo livello del flusso di importazione. La sua unica responsabilità è leggere i dati grezzi dalla fonte (file a larghezza fissa) e trasformarli in strutture dati TypeScript tipizzate e validate.

- **parsers**: Contiene i nuovi parser type-safe.
- **validators**: Contiene gli schemi di validazione (Zod) per ogni tipo di dato.
- **generators**: Contiene lo script per generare automaticamente i tipi TypeScript dai template di importazione nel database. 