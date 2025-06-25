# Orchestration Layer

Questo livello agisce come il "direttore d'orchestra". Coordina i tre livelli sottostanti (Acquisition, Transformation, Persistence) per eseguire un intero processo di importazione.

- **workflows**: Definisce i workflow completi per ogni tipo di importazione (es. `importPianoDeiContiWorkflow`).
- **handlers**: Contiene gli handler per le rotte API (Express.js) che avviano i workflow.
- **middleware**: Contiene middleware specifici per le rotte di importazione (es. gestione file upload avanzata). 