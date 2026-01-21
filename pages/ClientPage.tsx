
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClientLayout } from '../components/layout/ClientLayout.tsx';
import ClientDashboard from './dashboards/ClientDashboard.tsx';
import { PartnerLibraryView } from '../components/features/partner/views/PartnerLibraryView.tsx';

const ClientPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'home';

  const handleViewChange = useCallback((viewId: string) => {
    setSearchParams(prev => {
      prev.set('view', viewId);
      if (viewId !== 'files') prev.delete('folderId');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  return (
    <ClientLayout 
      title={activeView === 'home' ? "Dashboard do Parceiro" : "Biblioteca de arquivos"} 
      activeView={activeView} 
      onViewChange={handleViewChange}
    >
      <main className="animate-in fade-in slide-in-from-bottom-3 duration-700">
        {activeView === 'home' ? <ClientDashboard /> : <PartnerLibraryView />}
      </main>
    </ClientLayout>
  );
};

export default ClientPage;
