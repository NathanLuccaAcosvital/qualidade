
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { partnerService } from '../../../../lib/services/index.ts';
import { FileNode } from '../../../../types/index.ts';
import { DashboardStatsData } from '../../../../lib/services/interfaces.ts';

export const usePartnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user?.organizationId) {
      setIsLoading(false);
      return;
    }

    try {
      const [statsRes, filesRes] = await Promise.all([
        partnerService.getPartnerDashboardStats(user.organizationId),
        partnerService.getRecentActivity(user.organizationId)
      ]);
      
      setStats(statsRes);
      setRecentFiles(filesRes || []);
    } catch (error) {
      console.error("Falha ao carregar dashboard do parceiro:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.organizationId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    recentFiles,
    isLoading,
    refresh: loadDashboardData
  };
};
