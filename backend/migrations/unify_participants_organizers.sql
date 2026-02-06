-- Migration script to unify participants and organizers
-- This changes events from organizer_id to participant_id

-- Step 1: Add participant_id column to events table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='events' AND column_name='participant_id') THEN
        ALTER TABLE events ADD COLUMN participant_id INTEGER;
    END IF;
END $$;

-- Step 2: Migrate existing data
-- Link organizers to participants by world_id_hash where possible
UPDATE events e
SET participant_id = p.id
FROM organizers o, participants p
WHERE e.organizer_id = o.id
AND o.world_id_hash = p.world_id_hash
AND e.participant_id IS NULL;

-- Step 3: For events with organizers that don't have matching participants,
-- we'll need to handle them. For now, we'll set them to NULL and they'll need manual migration
-- or we can create placeholder participants if needed

-- Step 4: Make participant_id NOT NULL after migration
-- First, handle any NULL values (set to a default participant or handle separately)
-- For safety, we'll allow NULL temporarily and handle in application code

-- Step 5: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'events_participant_id_fkey'
    ) THEN
        ALTER TABLE events 
        ADD CONSTRAINT events_participant_id_fkey 
        FOREIGN KEY (participant_id) REFERENCES participants(id);
    END IF;
END $$;

-- Step 6: Create index on participant_id
CREATE INDEX IF NOT EXISTS ix_events_participant_id ON events(participant_id);

-- Step 7: Drop old organizer_id column and constraint
-- Note: Do this carefully - only after verifying migration is successful
-- ALTER TABLE events DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;
-- ALTER TABLE events DROP COLUMN IF EXISTS organizer_id;

-- Note: The organizer_id column drop is commented out for safety.
-- Uncomment after verifying the migration is successful.
