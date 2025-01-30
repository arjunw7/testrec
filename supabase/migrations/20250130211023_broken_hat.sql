/*
  # Fix created_by_id column type

  1. Changes
    - Change created_by_id column type from uuid to text to support Firebase auth IDs
  
  2. Security
    - Updates RLS policies to handle text comparison
*/

-- Change column type
ALTER TABLE recons 
ALTER COLUMN created_by_id TYPE text;

-- Update RLS policies to use text comparison
DROP POLICY IF EXISTS "Users can read own recons" ON recons;
DROP POLICY IF EXISTS "Users can insert own recons" ON recons;
DROP POLICY IF EXISTS "Users can update own recons" ON recons;

CREATE POLICY "Users can read own recons"
  ON recons
  FOR SELECT
  TO authenticated
  USING (created_by_id = auth.uid()::text);

CREATE POLICY "Users can insert own recons"
  ON recons
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by_id = auth.uid()::text);

CREATE POLICY "Users can update own recons"
  ON recons
  FOR UPDATE
  TO authenticated
  USING (created_by_id = auth.uid()::text);