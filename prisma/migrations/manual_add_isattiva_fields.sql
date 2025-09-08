-- Manual migration to add isAttiva fields to Commessa and VoceAnalitica tables
-- Run this script to add the missing fields

-- Add isAttiva field to Commessa table
ALTER TABLE "Commessa" 
ADD COLUMN IF NOT EXISTS "isAttiva" BOOLEAN NOT NULL DEFAULT true;

-- Add isAttiva field to VoceAnalitica table  
ALTER TABLE "VoceAnalitica" 
ADD COLUMN IF NOT EXISTS "isAttiva" BOOLEAN NOT NULL DEFAULT true;

-- Update existing records to be active by default
UPDATE "Commessa" SET "isAttiva" = true WHERE "isAttiva" IS NULL;
UPDATE "VoceAnalitica" SET "isAttiva" = true WHERE "isAttiva" IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "Commessa_isAttiva_idx" ON "Commessa"("isAttiva");
CREATE INDEX IF NOT EXISTS "VoceAnalitica_isAttiva_idx" ON "VoceAnalitica"("isAttiva");