-- Svuota le tabelle nell'ordine corretto per rispettare i vincoli di foreign key
DELETE FROM "Allocazione";
DELETE FROM "RigaIva";
DELETE FROM "RigaScrittura";
DELETE FROM "ScritturaContabile";
DELETE FROM "Conto"; 