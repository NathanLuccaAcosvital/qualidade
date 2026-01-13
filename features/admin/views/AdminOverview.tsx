import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminStats } from '../components/AdminStats.tsx';
import { AdminStatsData } from '../../../lib/services/interfaces.ts'; // Import AdminStatsData

interface AdminOverviewProps {
  adminStats: AdminStatsData | null;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ adminStats }) => {
  const { t } = useTranslation();

  if (!adminStats) {
    return null; // Or a loading/placeholder state
  }

  return (
    <AdminStats
      usersCount={adminStats.totalUsers}
      activeUsersCount={adminStats.activeUsers}
      clientsCount={adminStats.activeClients}
      logsCount={adminStats.logsLast24h}
    />
  );
};