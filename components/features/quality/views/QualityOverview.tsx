
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { fileService, adminService } from '../../../../lib/services/index.ts';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { QualityOverviewStats } from '../../../../lib/services/interfaces.ts';
import { QualityLoadingState, ErrorState } from '../components/ViewStates.tsx';
import { QualityOverviewCards } from '../components/QualityOverviewCards.tsx';

/**
 * QualityOverview (View)
 * Painel de controle de alto nível para analistas.
 */
export const QualityOverview: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState<QualityOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBaseData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const [globalStats, activeClientsRes] = await Promise.all([
          fileService.getDashboardStats(user),
          adminService.getClients({ status: 'ACTIVE' }, 1, 1), 
        ]);
        setStats({
          pendingDocs: globalStats.pendingValue || 0,
          totalActiveClients: activeClientsRes.total || 0
        });
      } catch (err) {
        setError(t('quality.errorLoadingQualityData'));
        showToast(t('quality.errorLoadingQualityData'), 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadBaseData();
  }, [user, showToast, t]);

  if (isLoading) return <QualityLoadingState message="Sincronizando Indicadores..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <QualityOverviewCards
        totalClients={stats?.totalActiveClients || 0}
        totalPendingDocs={stats?.pendingDocs || 0}
        onChangeView={(v) => setSearchParams({ view: v })}
      />
    </div>
  );
};
