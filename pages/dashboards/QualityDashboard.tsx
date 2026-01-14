
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { QualityOverview } from '../../components/features/quality/views/QualityOverview.tsx';
import { normalizeRole, UserRole } from '../../types/index.ts';

const QualityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== UserRole.QUALITY && role !== UserRole.ADMIN) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Layout title={t('quality.overview')}>
      <div className="space-y-8 animate-in fade-in duration-1000">
        <header className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Centro de Inspeção Técnica</h1>
            <p className="text-slate-500 text-sm font-medium">Monitore a conformidade documental da sua carteira de clientes em tempo real.</p>
        </header>
        
        <QualityOverview />
      </div>
    </Layout>
  );
};

export default QualityDashboard;
