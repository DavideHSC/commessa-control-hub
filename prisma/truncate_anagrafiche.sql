-- Script per svuotare le tabelle anagrafiche prima del test
-- Utilizzato per: npx prisma db execute --file prisma/truncate_anagrafiche.sql --schema prisma/schema.prisma

-- Prima svuotiamo le tabelle che dipendono da Cliente/Fornitore
DELETE FROM "Commessa" WHERE "clienteId" IS NOT NULL;

-- Ora possiamo svuotare le tabelle anagrafiche
DELETE FROM "Cliente";
DELETE FROM "Fornitore";

-- Conferma operazione
SELECT 'Tabelle Cliente e Fornitore svuotate con successo' as result; 