
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientHub } from '../components/ClientHub.tsx';
import { UserModal, ClientModal } from '../../admin/components/AdminModals.tsx';
import { ClientListToolbar, ClientListFilters } from '../components/ClientListControls.tsx';
import { ProcessingOverlay } from '../components/ViewStates.tsx';
import { useQualityClientManagement } from '../hooks/useQualityClientManagement.ts';
import { ClientOrganization } from '../../../../types/index.ts';

interface ClientListProps {
  onSelectClient: (client: ClientOrganization) => void;
}

/**
 * ClientList (Orchestrator View)
 * Atua exclusivamente na coordenação visual do portfólio B2B.
 */
export const ClientList: React.FC<ClientListProps> = ({ onSelectClient }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortKey, setSortKey] = useState<'NAME' | 'PENDING' | 'NEWEST' | 'LAST_ANALYSIS'>('NAME');

  const {
    sortedClients, clientSearch, setClientSearch, clientStatus, setClientStatus,
    isLoadingClients, isLoadingMoreClients, hasMoreClients, handleLoadMoreClients,
    isProcessing, qualityAnalysts, userModal, clientModal
  } = useQualityClientManagement(0);

  return (
    <div className="space-y-6">
      {/* Modais de Gestão (Contextos Isolados) */}
      <UserModal
        isOpen={userModal.isOpen}
        onClose={() => userModal.setOpen(false)}
        onSave={userModal.save}
        editingUser={userModal.editing}
        formData={userModal.data}
        setFormData={userModal.setData}
        organizations={sortedClients}
      />

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

      {isProcessing && <ProcessingOverlay message={t('common.updatingDatabase')} />}

      {/* Controles e Filtros de UI (Pure Components) */}
      <ClientListToolbar 
        search={clientSearch}
        onSearchChange={setClientSearch}
        onAddUser={() => userModal.open()}
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

      {/* Hub de Exibição de Dados (Multi-View) */}
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
  );
};
