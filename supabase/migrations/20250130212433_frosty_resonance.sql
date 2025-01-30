/*
  # Remove storage RLS and policies

  1. Changes
    - Disable RLS on storage.objects table
    - Drop storage policies for file access
  
  2. Security
    - Removes RLS restrictions on file uploads
    - Allows direct file access without auth checks
*/

-- Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can read own recon files" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert own recon files" ON storage.objects;