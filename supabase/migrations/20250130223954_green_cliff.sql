/*
  # Fix Schema Structure

  1. Changes
    - Drop existing tables and recreate them with correct structure
    - Restore original column types and constraints
    - Re-enable RLS policies
    - Fix storage bucket configuration

  2. Tables
    - recons
    - recon_files
    - recon_summary

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing tables in correct order
DROP TABLE IF EXISTS recon_summary;
DROP TABLE IF EXISTS recon_files;
DROP TABLE IF EXISTS recons;

-- Recreate recons table
CREATE TABLE IF NOT EXISTS recons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text NOT NULL,
  company_name text NOT NULL,
  policy_id text NOT NULL,
  policy_name text NOT NULL,
  insurer_name text NOT NULL,
  created_by_id text NOT NULL,
  created_by_email text NOT NULL,
  created_by_name text NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  recon_time timestamptz,
  export_time timestamptz,
  is_exported boolean DEFAULT false,
  time_to_recon interval GENERATED ALWAYS AS (recon_time - start_time) STORED,
  time_to_export interval GENERATED ALWAYS AS (export_time - start_time) STORED
);

-- Recreate recon_files table
CREATE TABLE IF NOT EXISTS recon_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recon_id uuid REFERENCES recons(id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('hr', 'insurer', 'genome')),
  storage_path text NOT NULL,
  original_name text NOT NULL,
  record_count integer NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- Recreate recon_summary table
CREATE TABLE IF NOT EXISTS recon_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recon_id uuid REFERENCES recons(id) ON DELETE CASCADE,
  summary jsonb NOT NULL
);

-- Enable RLS
ALTER TABLE recons ENABLE ROW LEVEL SECURITY;
ALTER TABLE recon_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE recon_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for recons
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

-- Create policies for recon_files
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

-- Create policies for recon_summary
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

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('recon-files', 'recon-files', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
CREATE POLICY "Users can read own recon files in storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recon-files' AND
  EXISTS (
    SELECT 1 FROM recons
    WHERE recons.id::text = (storage.foldername(name))[1]
    AND recons.created_by_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own recon files in storage"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recon-files' AND
  EXISTS (
    SELECT 1 FROM recons
    WHERE recons.id::text = (storage.foldername(name))[1]
    AND recons.created_by_id = auth.uid()::text
  )
);