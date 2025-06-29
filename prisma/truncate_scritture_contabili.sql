-- =============================================================================
-- SCRIPT PULIZIA PARSER 6: SCRITTURE CONTABILI (PostgreSQL)
-- =============================================================================
-- Pulisce tutte le tabelle coinvolte nell'importazione delle scritture contabili
-- mantenendo l'ordine corretto per evitare errori di foreign key
-- =============================================================================

-- Pulizia tabelle principal (in ordine di dipendenza)
DELETE FROM "Allocazione";
DELETE FROM "RigaIva";
DELETE FROM "RigaScrittura";
DELETE FROM "ScritturaContabile";

-- Pulizia entità correlate create durante l'import
-- (manteniamo solo quelle pre-esistenti nel seed)
DELETE FROM "Commessa" WHERE "id" LIKE 'commessa_import_%' OR "nome" LIKE 'Commessa importata -%';
DELETE FROM "Conto" WHERE "nome" LIKE 'Conto importato -%';
DELETE FROM "CausaleContabile" WHERE "descrizione" LIKE 'Causale importata -%';
DELETE FROM "CodiceIva" WHERE "descrizione" LIKE 'IVA importata -%';
DELETE FROM "VoceAnalitica" WHERE "nome" LIKE 'Voce analitica importata -%';
DELETE FROM "Cliente" WHERE "nome" LIKE 'Cliente importato -%';
DELETE FROM "Fornitore" WHERE "nome" LIKE 'Fornitore importato -%';

-- Pulizia log degli import (mantieni solo ultimi 50 per debug)
DELETE FROM "ImportLog" 
WHERE "id" NOT IN (
    SELECT "id" FROM "ImportLog" 
    ORDER BY "timestamp" DESC 
    LIMIT 50
);

-- Reset sequence per ID puliti (PostgreSQL - se esistono)
-- ALTER SEQUENCE "ScritturaContabile_id_seq" RESTART WITH 1;
-- ALTER SEQUENCE "RigaScrittura_id_seq" RESTART WITH 1;  
-- ALTER SEQUENCE "RigaIva_id_seq" RESTART WITH 1;
-- ALTER SEQUENCE "Allocazione_id_seq" RESTART WITH 1;

-- Statistiche finali
SELECT 
    'CLEANUP COMPLETATO' as Status,
    (SELECT COUNT(*) FROM "ScritturaContabile") as Scritture_Rimaste,
    (SELECT COUNT(*) FROM "RigaScrittura") as Righe_Rimaste,
    (SELECT COUNT(*) FROM "Allocazione") as Allocazioni_Rimaste,
    (SELECT COUNT(*) FROM "ImportLog") as Log_Mantenuti; 