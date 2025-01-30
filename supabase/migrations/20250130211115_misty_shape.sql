/*
  # Fix created_by_id column type

  1. Changes
    - Change created_by_id column type from uuid to text to support Firebase auth IDs
  
  2. Security
    - Temporarily drops RLS policies
    - Updates column type
    - Recreates RLS policies with text comparison
*/

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own recons" ON recons;
DROP POLICY IF EXISTS "Users can insert own recons" ON recons;
DROP POLICY IF EXISTS "Users can update own recons" ON recons;

-- Drop policies on dependent tables
DROP POLICY IF EXISTS "Users can read own recon files" ON recon_files;
DROP POLICY IF EXISTS "Users can insert own recon files" ON recon_files;
DROP POLICY IF EXISTS "Users can read own recon summary" ON recon_summary;
DROP POLICY IF EXISTS "Users can insert own recon summary" ON recon_summary;

-- Now we can safely alter the column
ALTER TABLE recons 
ALTER COLUMN created_by_id TYPE text;

-- Recreate policies with text comparison
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

-- Recreate policies for dependent tables
CREATE POLICY "Users can read own recon files"
  ON recon_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recons
      WHERE recons.id = recon_files.recon_id
      AND recons.created_by_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own recon files"
  ON recon_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recons
      WHERE recons.id = recon_files.recon_id
      AND recons.created_by_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can read own recon summary"
  ON recon_summary
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recons
      WHERE recons.id = recon_summary.recon_id
      AND recons.created_by_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own recon summary"
  ON recon_summary
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recons
      WHERE recons.id = recon_summary.recon_id
      AND recons.created_by_id = auth.uid()::text
    )
  );