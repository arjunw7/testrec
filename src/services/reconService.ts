import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import * as XLSX from 'xlsx';

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

    try {
      const { data: recon, error } = await supabase
        .from('recons')
        .insert({
          company_id: data.companyId,
          company_name: data.companyName,
          policy_id: data.policyId,
          policy_name: data.policyName,
          insurer_name: data.insurerName,
          created_by_id: user.uid,
          created_by_email: user.email || '',
          created_by_name: user.displayName || 'Unknown User',
        })
        .select()
        .single();

      if (error) throw error;
      return recon;
    } catch (error) {
      console.error('Failed to start recon:', error);
      throw new Error('Failed to start reconciliation');
    }
  },

  async uploadFile(reconId: string, data: any[], fileType: 'hr' | 'insurer' | 'genome', recordCount: number) {
    try {
      // Convert data to Excel format
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, fileType);
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = `${fileType}_data_${Date.now()}.xlsx`;
      const path = `${reconId}/${fileType}/${fileName}`;
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('recon-files')
        .upload(path, file, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

      if (storageError) throw storageError;

      // Save file metadata
      const { data: fileData, error: fileError } = await supabase
        .from('recon_files')
        .insert({
          recon_id: reconId,
          file_type: fileType,
          storage_path: path,
          original_name: fileName,
          record_count: recordCount,
        })
        .select()
        .single();

      if (fileError) throw fileError;
      return fileData;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw new Error('Failed to upload file');
    }
  },

  async getReconHistory(page = 1, pageSize = 10, searchTerm = '') {
    try {
      let query = supabase
        .from('recons')
        .select(`
          *,
          recon_files (*),
          recon_summary (*)
        `)
        .order('start_time', { ascending: false });

      if (searchTerm) {
        query = query.or(`
          company_name.ilike.%${searchTerm}%,
          policy_name.ilike.%${searchTerm}%,
          insurer_name.ilike.%${searchTerm}%
        `);
      }

      const { data, error, count } = await query
        .range((page - 1) * pageSize, page * pageSize - 1)
        .select('*', { count: 'exact' });

      if (error) throw error;
      return { data, count };
    } catch (error) {
      console.error('Failed to get recon history:', error);
      throw error;
    }
  },

  async getAnalytics(startDate: Date, endDate: Date) {
    try {
      const { data, error } = await supabase
        .from('recons')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (error) throw error;

      // Calculate analytics
      const totalRecons = data.length;
      
      // Calculate average recon time
      const reconTimes = data
        .filter(recon => recon.time_to_recon)
        .map(recon => this.parseDuration(recon.time_to_recon));
      
      const avgReconTime = reconTimes.length > 0 
        ? reconTimes.reduce((acc, time) => acc + time, 0) / reconTimes.length
        : 0;

      // Calculate average export time
      const exportTimes = data
        .filter(recon => recon.time_to_export)
        .map(recon => this.parseDuration(recon.time_to_export));
      
      const avgExportTime = exportTimes.length > 0
        ? exportTimes.reduce((acc, time) => acc + time, 0) / exportTimes.length
        : 0;

      // Group by insurer
      const insurerSplit = data.reduce((acc, recon) => {
        acc[recon.insurer_name] = (acc[recon.insurer_name] || 0) + 1;
        return acc;
      }, {});

      // Group by user
      const userSplit = data.reduce((acc, recon) => {
        const name = recon.created_by_name || 'Unknown User';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      // Group by day
      const dailyRecons = data.reduce((acc, recon) => {
        const date = new Date(recon.start_time).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        totalRecons,
        avgReconTime,
        avgExportTime,
        insurerSplit,
        userSplit,
        dailyRecons
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  },

  parseDuration(duration: string): number {
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return 0;
    const [_, hours, minutes, seconds] = match;
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
  },

  async downloadFile(path: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from('recon-files')
        .download(path);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  },

  async completeRecon(reconId: string, summary: any) {
    try {
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
          summary
        });

      if (summaryError) throw summaryError;
    } catch (error) {
      console.error('Failed to complete recon:', error);
      throw new Error('Failed to complete reconciliation');
    }
  },

  async markExported(reconId: string) {
    try {
      const { error } = await supabase
        .from('recons')
        .update({
          is_exported: true,
          export_time: new Date().toISOString()
        })
        .eq('id', reconId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark recon as exported:', error);
      throw new Error('Failed to mark reconciliation as exported');
    }
  }
};