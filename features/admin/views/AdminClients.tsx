import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Building2, Edit2, UserCheck, Loader2 } from 'lucide-react';
import { ClientModal } from '../modals/AdminModals.tsx';
import { useAdminClientManagement } from '../hooks/useAdminClientManagement.ts';
// Fix: Corrected import path for `User`
import { User } from '../../../types/index'; // ClientOrganization already imported via useAdminClientManagement

interface AdminClientsProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  qualityAnalysts: User[]; // Quality analysts passed from AdminPage
}

export const AdminClients: React.FC<AdminClientsProps> = ({ setIsSaving, qualityAnalysts }) => {
  const { t } = useTranslation();

  const {
    filteredClients,
    isLoadingClients,
    searchTerm,
    setSearchTerm,
    isClientModalOpen,
    setIsClientModalOpen,
    editingClient,
    openClientModal,
    handleSaveClient,
    clientFormData,
    setClientFormData,
  } = useAdminClientManagement({ setIsSaving, qualityAnalysts });

  return (
    <>
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
        clientFormData={clientFormData}
        setClientFormData={setClientFormData}
        qualityAnalysts={qualityAnalysts} // Pass quality analysts to modal
        onDelete={undefined} // Admin doesn't delete clients directly via modal (usually cascade operations)
      />

      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-xl shadow-sm">
        <div className="relative group w-full sm:w-auto flex-1 max-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input type="text" placeholder={t('common.search')} className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button onClick={() => openClientModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"><Building2 size={16} /> Nova Empresa</button>
        </div>
      </div>

      {isLoadingClients ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200" role="status">
          <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
          <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">CNPJ</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Analista Qual.</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Início Contrato</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredClients.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3"><Building2 size={16} className="text-blue-500" /><p className="font-semibold text-slate-900 text-sm">{c.name}</p></td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{c.cnpj}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 flex items-center gap-2">
                    <UserCheck size={14} className="text-emerald-500" />
                    {c.qualityAnalystName || t('common.na')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.contractDate}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{c.status}</span></td>
                  <td className="px-6 py-4 text-right"><button onClick={() => openClientModal(c)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};