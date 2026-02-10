-- Migration script to update database schema for new features
-- Run this script to add new columns and update existing tables

-- 1. Update participants table: Add google_id, make world_id_hash and wallet_address nullable
-- First, drop existing constraints if they exist
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_world_id_hash_key;
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_wallet_address_key;

-- Add google_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='participants' AND column_name='google_id') THEN
        ALTER TABLE participants ADD COLUMN google_id VARCHAR;
    END IF;
END $$;

-- Make world_id_hash nullable if it's not already
ALTER TABLE participants ALTER COLUMN world_id_hash DROP NOT NULL;

-- Make wallet_address nullable if it's not already  
ALTER TABLE participants ALTER COLUMN wallet_address DROP NOT NULL;

-- Add unique constraint on google_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_google_id') THEN
        ALTER TABLE participants ADD CONSTRAINT uq_google_id UNIQUE (google_id);
    END IF;
END $$;

-- Add index on google_id if it doesn't exist
CREATE INDEX IF NOT EXISTS ix_participants_google_id ON participants(google_id);

-- 2. Update organizers table: Remove email and password, add world_id_hash
-- Drop email and password columns if they exist
ALTER TABLE organizers DROP COLUMN IF EXISTS email;
ALTER TABLE organizers DROP COLUMN IF EXISTS hashed_password;

-- Add world_id_hash if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='organizers' AND column_name='world_id_hash') THEN
        ALTER TABLE organizers ADD COLUMN world_id_hash VARCHAR;
    END IF;
END $$;

-- Add unique constraint on world_id_hash
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_organizers_world_id_hash') THEN
        ALTER TABLE organizers ADD CONSTRAINT uq_organizers_world_id_hash UNIQUE (world_id_hash);
    END IF;
END $$;

-- Add index on world_id_hash if it doesn't exist
CREATE INDEX IF NOT EXISTS ix_organizers_world_id_hash ON organizers(world_id_hash);

-- 3. Update events table: Add is_published column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='events' AND column_name='is_published') THEN
        ALTER TABLE events ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update existing events to be unpublished by default
UPDATE events SET is_published = FALSE WHERE is_published IS NULL;
