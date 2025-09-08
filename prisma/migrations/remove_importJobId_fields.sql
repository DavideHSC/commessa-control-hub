-- Migration: Remove unused importJobId fields
-- Clean staging tables first, then remove columns

-- Clean staging tables (they are workspace tables, safe to truncate)
TRUNCATE TABLE staging_testate CASCADE;
TRUNCATE TABLE staging_righe_iva CASCADE;

-- Remove importJobId columns
ALTER TABLE staging_testate DROP COLUMN IF EXISTS "importJobId";
ALTER TABLE staging_righe_iva DROP COLUMN IF EXISTS "importJobId";