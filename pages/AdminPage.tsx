import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useAuth } from '../context/authContext.tsx';
import { useSearchParams, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/notificationContext.tsx';
import { UserRole, SystemStatus, User, ClientOrganization, AuditLog, NetworkPort, MaintenanceEvent } from '../types/index';

// Feature Views
import { AdminOverview } from '../features/admin/views/AdminOverview.tsx';
import { AdminUsers } from '../features/admin/views/AdminUsers.tsx';
import { AdminClients } from '../features/admin/views/AdminClients.tsx';
import { AdminLogs } from '../features/admin/views/AdminLogs.tsx';
import { AdminSettings } from '../features/admin/views/AdminSettings.tsx';

// Services
import { adminService, fileService, userService } from '../lib/services/index.ts';

// Icons
import { Loader2 } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // For redirecting if no tab
  const activeTab = searchParams.get('tab') || 'overview';
  const { showToast } = useToast();

  const [isLoadingCommonData, setIsLoadingCommonData] = useState(false);
  const [isSavingGlobal, setIsSavingGlobal] = useState(false); // For global admin operations like maintenance status

  // Common Admin Data (fetched once, or on refresh)
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [qualityAnalysts, setQualityAnalysts] = useState<User[]>([]);

  // Effect to ensure a default tab is always set
  useEffect(() => {
    if (!searchParams.get('tab')) {
      navigate('/admin?tab=overview', { replace: true });
    }
  }, [searchParams, navigate]);

  // Load common data for AdminPage when user or tab changes
  useEffect(() => {
    const loadCommonAdminData = async () => {
      if (!user) return;
      setIsLoadingCommonData(true);
      try {
        // Only fetch all common data if not in logs tab
        if (activeTab !== 'logs') {
          const [stats, sysStatus, qAnalysts] = await Promise.all([
            adminService.getAdminStats(),
            adminService.getSystemStatus(),
            userService.getUsersByRole(UserRole.QUALITY),
          ]);
          setAdminStats(stats);
          setSystemStatus(sysStatus);
          setQualityAnalysts(qAnalysts);
        } else {
          // If only logs view is active, just fetch system status if not already available
          if (!systemStatus) {
            const sysStatus = await adminService.getSystemStatus();
            setSystemStatus(sysStatus);
          }
        }
      } catch (err: any) {
        console.error("[AdminPage.tsx] Erro ao carregar dados comuns do admin:", err.message);
        showToast(`Erro ao carregar dados administrativos: ${err.message}`, 'error');
      } finally {
        setIsLoadingCommonData(false);
      }
    };
    if (user) {
      loadCommonAdminData();
    }
  }, [user, activeTab]); // Re-run when user or activeTab changes

  return (
    <Layout title={t('menu.management')}>
      <div className="flex flex-col relative w-full gap-6">
        {(isSavingGlobal || isLoadingCommonData) && (
          <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <Loader2 size={14} className="animate-spin" /> {t('common.updatingDatabase')}
          </div>
        )}

        {/* Render specific view based on activeTab */}
        {activeTab === 'overview' && adminStats && (
          <AdminOverview adminStats={adminStats} />
        )}

        {activeTab === 'users' && (
          <AdminUsers
            setIsSaving={setIsSavingGlobal}
          />
        )}

        {activeTab === 'clients' && qualityAnalysts && (
          <AdminClients
            setIsSaving={setIsSavingGlobal}
            qualityAnalysts={qualityAnalysts}
          />
        )}

        {activeTab === 'logs' && (
          <AdminLogs />
        )}

        {activeTab === 'settings' && systemStatus && (
          <AdminSettings
            systemStatus={systemStatus}
            setSystemStatus={setSystemStatus} // Pass the setter to allow settings to update this global state
            setIsSaving={setIsSavingGlobal}
          />
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;