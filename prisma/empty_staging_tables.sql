-- Svuota le tabelle per permettere la migrazione
-- L'ordine è importante a causa delle dipendenze (foreign keys)

-- Svuota prima le tabelle che dipendono da Commessa
DELETE FROM "BudgetVoce";
DELETE FROM "Allocazione";
-- Aggiunta tabella mancante che bloccava la pulizia
DELETE FROM "import_allocazioni";

-- Ora si può svuotare Commessa
DELETE FROM "Commessa";

-- Svuota le tabelle di staging
DELETE FROM "StagingAllocazione";
DELETE FROM "ImportScritturaRigaContabile";
DELETE FROM "ImportScritturaTestata"; 