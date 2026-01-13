import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
// Fix: Added Loader2 import from lucide-react
import { Search, UserPlus, Building2, LayoutGrid, List, ArrowDownCircle, AlertCircle, CheckCircle2, Users as UsersIcon, ArrowUpDown, Filter, Activity, Loader2 } from 'lucide-react';

// Sub-components
import { ClientHub } from '../components/ClientHub.tsx';
import { UserModal, ClientModal } from '../../admin/modals/AdminModals.tsx';

// Hooks
import { useQualityClientManagement } from '../hooks/useQualityClientManagement.ts';
// Fix: Corrected import path for ClientOrganization
import { ClientOrganization } from '../../../types/index';

interface ClientListProps {
  onSelectClient: (client: ClientOrganization) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ onSelectClient }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger a refresh for the hook

  const {
    sortedClients,
    clientSearch,
    setClientSearch,
    clientStatus,
    setClientStatus,
    isLoadingClients,
    isLoadingMoreClients,
    hasMoreClients,
    handleLoadMoreClients,
    isProcessing,
    qualityAnalysts,

    // User Modal
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    userFormData,
    setUserFormData,

    // Client Modal
    isClientModalOpen,
    setIsClientModalOpen,
    editingClient,
    openClientModal,
    handleSaveClient,
    clientFormData,
    setClientFormData,
  } = useQualityClientManagement(refreshTrigger); // Pass refreshTrigger to the hook

  // Local state for view/sort options, as these don't need to be in the hook
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortKey, setSortKey] = useState<'NAME' | 'PENDING' | 'NEWEST' | 'LAST_ANALYSIS'>('NAME');

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1); // Increment trigger to force hook re-fetch
  };

  return (
    <>
      {/* User Modal (managed by ClientList) */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        formData={userFormData}
        setFormData={setUserFormData}
        organizations={sortedClients} // Pass current list of clients for organization linking
      />

      {/* Client Modal (managed by ClientList) */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
        clientFormData={clientFormData}
        setClientFormData={setClientFormData}
        qualityAnalysts={qualityAnalysts}
        onDelete={undefined}
        requiresConfirmation={true}
      />

      {isProcessing && (
        <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          {/* Fix: Loader2 is now imported */}
          <Loader2 size={14} className="animate-spin" /> {t('common.updatingDatabase')}
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <input
            type="text"
            placeholder={t('quality.searchClient')}
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={clientSearch}
            onChange={e => setClientSearch(e.target.value)}
            aria-label={t('quality.searchClient')}
          />
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
          <button
            onClick={() => openUserModal()}
            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
            aria-label={t('quality.newClientUser')}
          >
            <UserPlus size={16} aria-hidden="true" /> {t('quality.newClientUser')}
          </button>
          <button
            onClick={() => openClientModal()}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
            aria-label={t('quality.newCompany')}
          >
            <Building2 size={16} aria-hidden="true" /> {t('quality.newCompany')}
          </button>
        </div>
      </div>

      {/* ClientHub and its controls */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4 mb-4">
        {/* Toggle de View */}
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner" role="group" aria-label={t('files.viewOptions')}>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            aria-label={t('files.listView')}
            aria-pressed={viewMode === 'list'}
          >
            <List size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            aria-label={t('files.gridView')}
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden xl:block" aria-hidden="true" />

        {/* Ordenação por Criticidade */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl flex-1 xl:flex-none">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="bg-transparent border-none text-xs font-bold text-slate-600 px-3 py-1.5 focus:ring-0 cursor-pointer"
            aria-label={t('files.sortBy')}
          >
            <option value="NAME">{t('files.sort.nameAsc')}</option>
            <option value="PENDING">{t('dashboard.criticalPendencies')}</option>
            <option value="LAST_ANALYSIS">{t('dashboard.lastAnalysis')} ({t('files.sort.dateNew')})</option>
            <option value="NEWEST">{t('dashboard.recent')}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl" role="group" aria-label={t('common.filterByStatus')}>
          {(['ALL', 'ACTIVE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setClientStatus(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                clientStatus === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-pressed={clientStatus === status}
              aria-label={status === 'ALL' ? t('dashboard.allClients') : t('dashboard.activeClients')}
            >
              {status === 'ALL' ? t('dashboard.allClients') : t('dashboard.activeClients')}
            </button>
          ))}
        </div>
      </div>

      <ClientHub
        clients={sortedClients}
        clientSearch={clientSearch} // Passed down for filtering clientHub's internal display
        setClientSearch={setClientSearch}
        clientStatus={clientStatus}
        setClientStatus={setClientStatus}
        onSelectClient={onSelectClient}
        isLoading={isLoadingClients}
        isLoadingMore={isLoadingMoreClients}
        hasMore={hasMoreClients}
        onLoadMore={handleLoadMoreClients}
        viewMode={viewMode} // Pass view mode
        sortKey={sortKey} // Pass sort key
      />
    </>
  );
};