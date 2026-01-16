import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { qualityService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { FileNode, QualityStatus } from '../../../../types/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';

export const useQualityFlowAudit = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [pendingFiles, setPendingFiles] = useState<FileNode[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuditFlowData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Busca pendências de todas as organizações
      const pending = await qualityService.getPendingInspections(user.id);

      // Busca arquivos contestados globalmente
      const { data: rejected, error: rejectedError } = await supabase
        .from('files')
        .select('*')
        .or(`metadata->>status.eq.${QualityStatus.REJECTED},metadata->>status.eq.${QualityStatus.TO_DELETE}`)
        .neq('type', 'FOLDER');

      if (rejectedError) {
        console.error("Erro ao buscar arquivos rejeitados:", rejectedError);
        showToast(t('quality.errorLoadingQualityData'), 'error');
      }

      setPendingFiles(pending);
      setRejectedFiles(rejected || []);
    } catch (err) {
      console.error("Quality Flow Audit Context Error:", err);
      showToast(t('quality.errorLoadingQualityData'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, t, showToast]);

  useEffect(() => {
    loadAuditFlowData();
  }, [loadAuditFlowData]);

  return { pendingFiles, rejectedFiles, isLoading, refresh: loadAuditFlowData };
};
