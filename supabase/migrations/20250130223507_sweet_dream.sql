-- First drop all dependent policies
DROP POLICY IF EXISTS "Users can read own recons" ON recons;
DROP POLICY IF EXISTS "Users can insert own recons" ON recons;
DROP POLICY IF EXISTS "Users can update own recons" ON recons;
DROP POLICY IF EXISTS "Users can read own recon files" ON recon_files;
DROP POLICY IF EXISTS "Users can insert own recon files" ON recon_files;
DROP POLICY IF EXISTS "Users can read own recon summary" ON recon_summary;
DROP POLICY IF EXISTS "Users can insert own recon summary" ON recon_summary;

-- Add new columns
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
  'export_time', export_time
);

-- First drop the generated columns
ALTER TABLE recons 
DROP COLUMN time_to_recon,
DROP COLUMN time_to_export;

-- Now we can safely drop the source columns
ALTER TABLE recons 
DROP COLUMN created_by_id,
DROP COLUMN created_by_email,
DROP COLUMN created_by_name,
DROP COLUMN start_time,
DROP COLUMN recon_time,
DROP COLUMN export_time;

-- Update recon_summary table structure
ALTER TABLE recon_summary
ADD COLUMN data jsonb;

-- Drop old columns if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recon_summary' AND column_name = 'perfect_matches') THEN
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
  END IF;
END $$;

-- Recreate policies with new JSONB structure
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

-- Recreate policies for dependent tables
CREATE POLICY "Users can read own recon files"
  ON recon_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recons
      WHERE recons.id = recon_files.recon_id
      AND recons.created_by->>'id' = auth.uid()::text
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
      AND recons.created_by->>'id' = auth.uid()::text
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
      AND recons.created_by->>'id' = auth.uid()::text
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
      AND recons.created_by->>'id' = auth.uid()::text
    )
  );