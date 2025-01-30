import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';

export const reconService = {
  async startRecon(data: {
    companyId: string;
    companyName: string;
    policyId: string;
    policyName: string;
    insurerName: string;
  }) {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const { data: recon, error } = await supabase
      .from('recons')
      .insert({
        company_id: data.companyId,
        company_name: data.companyName,
        policy_id: data.policyId,
        policy_name: data.policyName,
        insurer_name: data.insurerName,
        created_by_id: user.uid,
        created_by_email: user.email,
        created_by_name: user.displayName,
      })
      .select()
      .single();

    if (error) throw error;
    return recon;
  },

  async uploadFile(reconId: string, file: File, fileType: 'hr' | 'insurer' | 'genome', recordCount: number) {
    const path = `${reconId}/${fileType}/${file.name}`;
    
    // Upload file to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('recon-files')
      .upload(path, file);

    if (storageError) throw storageError;

    // Save file metadata
    const { data: fileData, error: fileError } = await supabase
      .from('recon_files')
      .insert({
        recon_id: reconId,
        file_type: fileType,
        storage_path: path,
        original_name: file.name,
        record_count: recordCount,
      })
      .select()
      .single();

    if (fileError) throw fileError;
    return fileData;
  },

  async completeRecon(reconId: string, summary: any) {
    // Update recon status
    const { error: reconError } = await supabase
      .from('recons')
      .update({ recon_time: new Date().toISOString() })
      .eq('id', reconId);

    if (reconError) throw reconError;

    // Save summary
    const { error: summaryError } = await supabase
      .from('recon_summary')
      .insert({
        recon_id: reconId,
        perfect_matches: summary.perfectMatches,
        additions: summary.tobeEndorsed_add,
        manual_additions: summary.tobeEndorsed_add_manual,
        ar_update_additions: summary.tobeEndorsed_add_ar_update_manual,
        edits: summary.tobeEndorsed_edit,
        offboards: summary.tobeEndorsed_offboard,
        offboard_confirmations: summary.toBeEndorsed_offboard_conf,
        manual_offboards: summary.toBeEndorsed_offboard_conf_manual,
        offboard_or_adds: summary.toBeEndorsed_offboard_or_add,
      });

    if (summaryError) throw summaryError;
  },

  async markExported(reconId: string) {
    const { error } = await supabase
      .from('recons')
      .update({
        is_exported: true,
        export_time: new Date().toISOString()
      })
      .eq('id', reconId);

    if (error) throw error;
  }
};