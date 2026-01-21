
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Loader2, Users as UsersIcon } from 'lucide-react';
import { UserList } from '../components/UserList.tsx';
import { UserModal } from '../components/AdminModals.tsx';
import { PaginationControls } from '../../../common/PaginationControls.tsx';
import { useUserCollection } from '../hooks/useUserCollection.ts';
import { useUserFormState } from '../hooks/useUserFormState.ts';
import { adminService } from '../../../../lib/services/index.ts';
import { UserRole, ClientOrganization } from '../../../../types/index.ts';

interface AdminUsersProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  isSaving?: boolean;
  restrictedToRole?: UserRole; 
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ setIsSaving, isSaving = false, restrictedToRole }) => {
  const { t } = useTranslation();
  const collection = useUserCollection(restrictedToRole);
  const form = useUserFormState(collection.refresh);
  const [orgs, setOrgs] = useState<ClientOrganization[]>([]);

  useEffect(() => {
    adminService.getClients({ status: 'ACTIVE' }, 1, 1000).then(res => setOrgs(res.items));
  }, []);

  useEffect(() => {
    if (form.isProcessing !== isSaving) setIsSaving(form.isProcessing);
  }, [form.isProcessing, isSaving, setIsSaving]);

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      <UserModal
        isOpen={form.isOpen}
        onClose={() => form.setIsOpen(false)}
        onSave={form.handleSave}
        onFlagDeletion={form.handleFlagDeletion}
        editingUser={form.editingUser}
        formData={form.formData}
        setFormData={form.setFormData}
        organizations={orgs}
        isSaving={form.isProcessing}
      />

      <div className="bg-white p-3 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-3 w-full shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
          <div className="relative w-full max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18} />
            <input
              type="text"
              placeholder="Identidade ou e-mail corporativo..."
              className="pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm w-full outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all font-medium"
              value={collection.searchTerm}
              onChange={e => collection.setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button onClick={() => collection.setViewMode('ACTIVE')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${collection.viewMode === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Ativos</button>
            <button onClick={() => collection.setViewMode('ARCHIVED')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${collection.viewMode === 'ARCHIVED' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500'}`}>Arquivados</button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 w-full border-t border-slate-50 pt-2">
          {!restrictedToRole && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['ALL', UserRole.ADMIN, UserRole.QUALITY, UserRole.CLIENT] as const).map(role => (
                <button key={role} onClick={() => collection.setRoleFilter(role)} className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${collection.roleFilter === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  {role === 'ALL' ? 'Todos' : t(`roles.${role}`)}
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => form.openModal(undefined, restrictedToRole)}
            className="bg-[#081437] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2 shadow-lg active:scale-95 transition-all hover:bg-slate-800"
          >
            <UserPlus size={16} className="text-blue-400" /> Criar Parceiro
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {collection.loading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white"><Loader2 size={40} className="animate-spin text-blue-600 mb-4" /><p className="font-black text-[10px] uppercase tracking-[4px] text-slate-400">Sincronizando...</p></div>
        ) : collection.filteredUsers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white text-center p-8"><UsersIcon size={40} className="text-slate-200 mb-4" /><h3 className="text-sm font-bold text-slate-800 uppercase">Sem registros localizados</h3></div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <UserList users={collection.filteredUsers} onEdit={form.openModal} />
            </div>
            <PaginationControls 
              currentPage={collection.page}
              pageSize={collection.pageSize}
              totalItems={collection.totalItems}
              onPageChange={collection.setPage}
              onPageSizeChange={collection.setPageSize}
              isLoading={collection.loading}
            />
          </>
        )}
      </div>
    </div>
  );
};
