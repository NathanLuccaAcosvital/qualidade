import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientHub } from '../components/ClientHub.tsx';
import { ClientModal } from '../../admin/components/AdminModals.tsx';
import { ClientListToolbar, ClientListFilters } from '../components/ClientListControls.tsx';
import { ProcessingOverlay } from '../components/ViewStates.tsx';
import { useQualityClientManagement } from '../hooks/useQualityClientManagement.ts';
import { ClientOrganization } from '../../../../types/index.ts';

interface ClientListProps {
  onSelectClient: (client: ClientOrganization) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ onSelectClient }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortKey, setSortKey] = useState<'NAME' | 'PENDING' | 'NEWEST' | 'LAST_ANALYSIS'>('NAME');

  const {
    sortedClients, clientSearch, setClientSearch, clientStatus, setClientStatus,
    isLoadingClients, isLoadingMoreClients, hasMoreClients, handleLoadMoreClients,
    isProcessing, qualityAnalysts, clientModal
  } = useQualityClientManagement(0);

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4 animate-in fade-in duration-500">
      <ClientModal
        isOpen={clientModal.isOpen}
        onClose={() => clientModal.setOpen(false)}
        onSave={clientModal.save}
        editingClient={clientModal.editing}
        clientFormData={clientModal.data}
        setClientFormData={clientModal.setData}
        qualityAnalysts={qualityAnalysts}
        requiresConfirmation={true}
      />

      {isProcessing && <ProcessingOverlay message="Sincronizando registros..." />}

      <div className="shrink-0 space-y-4">
        <ClientListToolbar 
          search={clientSearch}
          onSearchChange={setClientSearch}
          onAddCompany={() => clientModal.open()}
          t={t}
        />

        <ClientListFilters 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortKey={sortKey}
          onSortChange={setSortKey}
          status={clientStatus}
          onStatusChange={setClientStatus}
          t={t}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <ClientHub
          clients={sortedClients}
          onSelectClient={onSelectClient}
          isLoading={isLoadingClients}
          isLoadingMore={isLoadingMoreClients}
          hasMore={hasMoreClients}
          onLoadMore={handleLoadMoreClients}
          viewMode={viewMode}
          sortKey={sortKey}
        />
      </div>
    </div>
  );
};