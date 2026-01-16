
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { qualityService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { ClientOrganization, FileNode, QualityStatus } from '../../../../types/index.ts';

export const useQualityPortfolio = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [pendingFiles, setPendingFiles] = useState<FileNode[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQualityData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Busca Portfólio Global e Pendências Globais
      const [portfolio, pending] = await Promise.all([
        qualityService.getManagedPortfolio(user.id), // Agora retorna todos
        qualityService.getPendingInspections(user.id) // Agora retorna todos
      ]);

      // 2. Busca arquivos contestados globalmente
      const { data: rejected, error: rejectedError } = await supabase
        .from('files')
        .select('*')
        .or(`metadata->>status.eq.${QualityStatus.REJECTED},metadata->>status.eq.${QualityStatus.TO_DELETE}`)
        .neq('type', 'FOLDER');

      if (rejectedError) console.error("Erro ao buscar arquivos rejeitados:", rejectedError);

      setClients(portfolio);
      setPendingFiles(pending);
      setRejectedFiles(rejected || []);
    } catch (err) {
      console.error("Quality Context Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadQualityData();
  }, [loadQualityData]);

  return { clients, pendingFiles, rejectedFiles, isLoading, refresh: loadQualityData };
};
