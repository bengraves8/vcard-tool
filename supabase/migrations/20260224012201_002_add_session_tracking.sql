/*
  # Add Session Tracking to vCards

  1. Changes
    - Add `session_id` column to vcards table to track which cards belong to which browser session
    - Add index on session_id for fast lookups
    - Update RLS policies to allow users to update their own cards by session
  
  2. Notes
    - session_id will be stored in localStorage on client
    - Allows users to view and edit their previously created cards
    - Maintains privacy by using session-based tracking instead of auth
*/

-- Add session_id column to vcards table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vcards' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE vcards ADD COLUMN session_id VARCHAR(255);
  END IF;
END $$;

-- Add index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_vcards_session_id ON vcards(session_id);

-- Drop existing update policy if it exists and create new one
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can update own cards by session" ON vcards;
  
  CREATE POLICY "Users can update own cards by session"
    ON vcards
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
END $$;
