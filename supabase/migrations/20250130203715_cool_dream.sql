/*
  # Recon History Schema

  1. New Tables
    - `recons`
      - Main table storing recon information
      - Tracks timing, user info, and summary data
    - `recon_files`
      - Stores information about uploaded files
      - Links to storage bucket files
    - `recon_summary`
      - Stores detailed summary results
      - One-to-one relationship with recons

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create recons table
CREATE TABLE IF NOT EXISTS recons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text NOT NULL,
  company_name text NOT NULL,
  policy_id text NOT NULL,
  policy_name text NOT NULL,
  insurer_name text NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  recon_time timestamptz,
  export_time timestamptz,
  created_by_id uuid NOT NULL,
  created_by_email text NOT NULL,
  created_by_name text NOT NULL,
  is_exported boolean DEFAULT false,
  time_to_recon interval GENERATED ALWAYS AS (recon_time - start_time) STORED,
  time_to_export interval GENERATED ALWAYS AS (export_time - start_time) STORED
);

-- Create recon_files table
CREATE TABLE IF NOT EXISTS recon_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recon_id uuid REFERENCES recons(id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('hr', 'insurer', 'genome')),
  storage_path text NOT NULL,
  original_name text NOT NULL,
  record_count integer NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Create recon_summary table
CREATE TABLE IF NOT EXISTS recon_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recon_id uuid REFERENCES recons(id) ON DELETE CASCADE,
  perfect_matches jsonb,
  additions jsonb,
  manual_additions jsonb,
  ar_update_additions jsonb,
  edits jsonb,
  offboards jsonb,
  offboard_confirmations jsonb,
  manual_offboards jsonb,
  offboard_or_adds jsonb
);

-- Enable RLS
ALTER TABLE recons ENABLE ROW LEVEL SECURITY;
ALTER TABLE recon_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE recon_summary ENABLE ROW LEVEL SECURITY;

-- Policies for recons
CREATE POLICY "Users can read own recons"
  ON recons
  FOR SELECT
  TO authenticated
  USING (created_by_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own recons"
  ON recons
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by_id::text = auth.uid()::text);

CREATE POLICY "Users can update own recons"
  ON recons
  FOR UPDATE
  TO authenticated
  USING (created_by_id::text = auth.uid()::text);

-- Policies for recon_files
CREATE POLICY "Users can read own recon files"
  ON recon_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recons
      WHERE recons.id = recon_files.recon_id
      AND recons.created_by_id::text = auth.uid()::text
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
      AND recons.created_by_id::text = auth.uid()::text
    )
  );

-- Policies for recon_summary
CREATE POLICY "Users can read own recon summary"
  ON recon_summary
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recons
      WHERE recons.id = recon_summary.recon_id
      AND recons.created_by_id::text = auth.uid()::text
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
      AND recons.created_by_id::text = auth.uid()::text
    )
  );