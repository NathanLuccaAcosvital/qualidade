import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { qualityService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { FileNode, QualityStatus, UserRole, normalizeRole } from '../../../../types/index.ts';

export interface QualityPortfolioData {
    pending: FileNode[];
    sent: FileNode[];
    rejected: FileNode[];
    approved: FileNode[];
}

export const useQualityPortfolio = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QualityPortfolioData>({
    pending: [],
    sent: [],
    rejected: [],
    approved: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadQualityData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const role = normalizeRole(user.role);
      const isClient = role === UserRole.CLIENT;

      let query = supabase
        .from('files')
        .select('*, profiles:uploaded_by(full_name)')
        .neq('type', 'FOLDER')
        .order('updated_at', { ascending: false });

      if (isClient) {
        query = query.eq('owner_id', user.organizationId);
      }

      const { data: allFiles, error } = await query;
      
      if (error) throw error;

      const categorized: QualityPortfolioData = {
        pending: [],
        sent: [],
        rejected: [],
        approved: []
      };

      (allFiles || []).forEach(file => {
        const status = file.metadata?.status;
        if (status === QualityStatus.APPROVED) {
            categorized.approved.push(file);
        } else if (status === QualityStatus.REJECTED || status === QualityStatus.TO_DELETE) {
            categorized.rejected.push(file);
        } else if (status === QualityStatus.SENT) {
            categorized.sent.push(file);
        } else {
            // Default ou PENDING
            categorized.pending.push(file);
        }
      });

      setData(categorized);
    } catch (err) {
      console.error("[QualityPortfolio] Falha na sincronização:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadQualityData();
  }, [loadQualityData]);

  return { 
    pendingFiles: data.pending, 
    sentFiles: data.sent,
    rejectedFiles: data.rejected, 
    approvedFiles: data.approved,
    isLoading, 
    refresh: loadQualityData 
  };
};