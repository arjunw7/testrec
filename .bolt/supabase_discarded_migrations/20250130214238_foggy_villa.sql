/*
  # Combine recon columns and update summary structure

  1. Changes
    - Combine created_by columns into a JSONB column
    - Combine time-related columns into a JSONB column
    - Update recon_summary table structure for better organization
  
  2. Security
    - Maintains existing RLS policies
    - Updates policies to work with new column structure
*/

-- First, create temporary columns to store the combined data
ALTER TABLE recons 
ADD COLUMN created_by jsonb,
ADD COLUMN timing_info jsonb;

-- Update the temporary columns with combined data
UPDATE recons SET
created_by = jsonb_build_object(
  'id', created_by_id,
  'email', created_by_email,
  'name', created_by_name
),
timing_info = jsonb_build_object(
  'start_time', start_time,
  'recon_time', recon_time,
  'export_time', export_time,
  'time_to_recon', time_to_recon,
  'time_to_export', time_to_export
);

-- Drop the old columns
ALTER TABLE recons 
DROP COLUMN created_by_id,
DROP COLUMN created_by_email,
DROP COLUMN created_by_name,
DROP COLUMN start_time,
DROP COLUMN recon_time,
DROP COLUMN export_time,
DROP COLUMN time_to_recon,
DROP COLUMN time_to_export;

-- Update RLS policies to use the new JSONB structure
DROP POLICY IF EXISTS "Users can read own recons" ON recons;
DROP POLICY IF EXISTS "Users can insert own recons" ON recons;
DROP POLICY IF EXISTS "Users can update own recons" ON recons;

CREATE POLICY "Users can read own recons"
  ON recons
  FOR SELECT
  TO authenticated
  USING (created_by->>'id' = auth.uid()::text);

CREATE POLICY "Users can insert own recons"
  ON recons
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by->>'id' = auth.uid()::text);

CREATE POLICY "Users can update own recons"
  ON recons
  FOR UPDATE
  TO authenticated
  USING (created_by->>'id' = auth.uid()::text);

-- Update recon_summary table to use a more organized structure
ALTER TABLE recon_summary
DROP COLUMN perfect_matches,
DROP COLUMN additions,
DROP COLUMN manual_additions,
DROP COLUMN ar_update_additions,
DROP COLUMN edits,
DROP COLUMN offboards,
DROP COLUMN offboard_confirmations,
DROP COLUMN manual_offboards,
DROP COLUMN offboard_or_adds;

ALTER TABLE recon_summary
ADD COLUMN summary jsonb;