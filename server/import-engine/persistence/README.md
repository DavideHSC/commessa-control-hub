# Persistence Layer

Questo è il terzo e ultimo livello del flusso dati. La sua responsabilità è salvare i dati nel database in modo sicuro, transazionale e atomico.

- **staging**: Contiene le definizioni e la logica per le tabelle di staging, usate per garantire l'integrità dei dati prima del commit finale.
- **transactions**: Implementa i pattern transazionali (es. Staging-Commit) per garantire operazioni atomiche.
- **dlq**: Gestisce la Dead Letter Queue, salvando i record che falliscono il processo di importazione per analisi successive. 