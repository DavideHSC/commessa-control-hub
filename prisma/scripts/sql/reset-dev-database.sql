-- =============================================================================
-- SCRIPT DI RESET COMPLETO PER IL DATABASE DI SVILUPPO (PostgreSQL)
-- =============================================================================
-- ATTENZIONE: Questo script CANCELLA IRREVERSIBILMENTE i dati da tutte le 
-- tabelle elencate. Usare solo in ambiente di sviluppo.
--
-- Esecuzione:
-- npx prisma db execute --file prisma/scripts/sql/reset-dev-database.sql
-- =============================================================================

BEGIN;

-- Disabilita temporaneamente i trigger per evitare problemi di dipendenze complesse
-- durante il truncate, sebbene CASCADE dovrebbe gestire la maggior parte dei casi.
SET session_replication_role = 'replica';

-- L'ordine qui non è fondamentale grazie a CASCADE, ma è buona norma
-- elencare prima le tabelle che dipendono da altre.

-- 1. Svuota tutte le tabelle di dati transazionali e di importazione
TRUNCATE TABLE 
    "public"."Allocazione",
    "public"."RigaIva",
    "public"."RigaScrittura",
    "public"."ScritturaContabile",
    "public"."BudgetVoce",
    "public"."RegolaRipartizione",
    "public"."ImportAllocazione",
    "public"."ImportScritturaRigaContabile",
    "public"."ImportScritturaRigaIva",
    "public"."import_scritture_testate",
    "public"."ImportLog"
RESTART IDENTITY CASCADE;

-- 2. Svuota tutte le tabelle anagrafiche e di configurazione
TRUNCATE TABLE
    "public"."Commessa",
    "public"."Conto",
    "public"."VoceAnalitica",
    "public"."CausaleContabile",
    "public"."CodiceIva",
    "public"."CondizionePagamento",
    "public"."Cliente",
    "public"."Fornitore",
    "public"."WizardState"
RESTART IDENTITY CASCADE;

-- 3. Svuota tutte le tabelle di STAGING
TRUNCATE TABLE
    "public"."staging_conti",
    "public"."staging_testate",
    "public"."staging_righe_contabili",
    "public"."staging_righe_iva",
    "public"."staging_allocazioni",
    "public"."staging_codici_iva",
    "public"."staging_causali_contabili",
    "public"."staging_condizioni_pagamento",
    "public"."staging_anagrafiche"
RESTART IDENTITY CASCADE;


-- Riabilita i trigger
SET session_replication_role = 'origin';

COMMIT;

SELECT '✅ Reset del database di sviluppo completato con successo.' as status;