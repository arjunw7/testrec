import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('recon-files')
    .upload(path, file);

  if (error) throw error;
  return data;
};

export const getFileUrl = (path: string) => {
  const { data } = supabase.storage
    .from('recon-files')
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const deleteFile = async (path: string) => {
  const { error } = await supabase.storage
    .from('recon-files')
    .remove([path]);

  if (error) throw error;
};

export const createRecon = async (reconData: any) => {
  const { data, error } = await supabase
    .from('recons')
    .insert(reconData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRecon = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('recons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const saveReconFiles = async (files: any[]) => {
  const { data, error } = await supabase
    .from('recon_files')
    .insert(files)
    .select();

  if (error) throw error;
  return data;
};

export const saveReconSummary = async (summary: any) => {
  const { data, error } = await supabase
    .from('recon_summary')
    .insert(summary)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getReconHistory = async () => {
  const { data, error } = await supabase
    .from('recons')
    .select(`
      *,
      recon_files (*),
      recon_summary (*)
    `)
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data;
};

export const getReconById = async (id: string) => {
  const { data, error } = await supabase
    .from('recons')
    .select(`
      *,
      recon_files (*),
      recon_summary (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};