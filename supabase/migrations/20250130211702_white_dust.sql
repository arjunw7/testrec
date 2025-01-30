/*
  # Create storage bucket for recon files

  1. Changes
    - Creates a new storage bucket for recon files
    - Sets up RLS policies for bucket access
  
  2. Security
    - Only authenticated users can access their own files
    - Files are organized by recon ID
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recon-files', 'recon-files', false);

-- Create policy to allow authenticated users to read their own files
CREATE POLICY "Users can read own recon files"
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

-- Create policy to allow authenticated users to insert their own files
CREATE POLICY "Users can insert own recon files"
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

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;