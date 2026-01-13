import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { fileService, adminService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { QualityOverviewStats } from '../../../lib/services/interfaces.ts';

// Sub-components
import { QualityOverviewCards } from '../components/QualityOverviewCards.tsx';

export const QualityOverview: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState<QualityOverviewStats>({ pendingDocs: 0, totalActiveClients: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadBaseData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const [globalStats, activeClientsRes] = await Promise.all([
            fileService.getDashboardStats(user),
            adminService.getClients({ status: 'ACTIVE' }, 1, 1), // Only need total count
          ]);
          setStats({
            pendingDocs: globalStats.pendingValue || 0,
            totalActiveClients: activeClientsRes.total || 0
          });
        } catch (err) {
          console.error("Erro ao carregar dados de qualidade:", err);
          showToast(t('quality.errorLoadingQualityData'), 'error');
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadBaseData();
  }, [user, refreshTrigger, showToast, t]);


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <QualityOverviewCards
        totalClients={stats.totalActiveClients}
        totalPendingDocs={stats.pendingDocs}
        onChangeView={(v) => setSearchParams({ view: v })}
      />
    </div>
  );
};
