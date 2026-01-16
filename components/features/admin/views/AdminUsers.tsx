
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Loader2, ShieldCheck, Archive, Users as UsersIcon, Briefcase } from 'lucide-react';
import { UserList } from '../components/UserList.tsx';
import { UserModal } from '../components/AdminModals.tsx';
import { useAdminUserManagement } from '../hooks/useAdminUserManagement.ts';
import { UserRole } from '../../../../types/index.ts';

interface AdminUsersProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  isSaving?: boolean;
  restrictedToRole?: UserRole; 
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ setIsSaving, isSaving = false, restrictedToRole }) => {
  const { t } = useTranslation();
  const management = useAdminUserManagement({ setIsSaving, isSavingGlobal: isSaving, restrictedToRole });

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      <UserModal
        isOpen={management.isUserModalOpen}
        onClose={() => management.setIsUserModalOpen(false)}
        onSave={management.handleSaveUser}
        onFlagDeletion={management.handleFlagDeletion}
        editingUser={management.editingUser}
        formData={management.formData}
        setFormData={management.setFormData}
        organizations={management.clientsList}
        isSaving={isSaving}
      />

      <UsersControlPanel 
        searchTerm={management.searchTerm}
        onSearchChange={management.setSearchTerm}
        roleFilter={management.roleFilter}
        onRoleFilterChange={management.setRoleFilter}
        viewMode={management.viewMode}
        onViewModeChange={management.setViewMode}
        onCreateClick={() => management.openUserModal()}
        t={t}
        hideRoleFilter={!!restrictedToRole}
      />

      {management.isLoadingUsers ? (
        <LoadingUsersState />
      ) : management.filteredUsers.length === 0 ? (
        <EmptyUsersState isRestricted={!!restrictedToRole} />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col space-y-3 overflow-hidden">
          {management.viewMode === 'ARCHIVED' && (
            <div className="px-6 py-2 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 shrink-0">
              <Archive size={14} className="text-amber-600" />
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                Exibindo Arquivo Morto: Deleção pendente por auditoria.
              </p>
            </div>
          )}
          <UserList 
            users={management.filteredUsers} 
            onEdit={management.openUserModal} 
          />
        </div>
      )}
    </div>
  );
};

const UsersControlPanel = ({ searchTerm, onSearchChange, roleFilter, onRoleFilterChange, viewMode, onViewModeChange, onCreateClick, t, hideRoleFilter }: any) => (
  <div className="bg-white p-3 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-3 w-full shrink-0">
    <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
        <div className="relative w-full max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18} />
            <input
                type="text"
                placeholder="Identidade, e-mail ou vínculo corporativo..."
                className="pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm w-full outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all font-medium"
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
            />
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
            <button onClick={() => onViewModeChange('ACTIVE')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <UsersIcon size={12} /> Ativos
            </button>
            <button onClick={() => onViewModeChange('ARCHIVED')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'ARCHIVED' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Archive size={12} /> Arquivados
            </button>
        </div>
    </div>

    <div className="flex items-center justify-between gap-3 w-full overflow-x-auto no-scrollbar pb-1 border-t border-slate-50 pt-2">
      {hideRoleFilter ? (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg">
           <Briefcase size={12} />
           <span className="text-[9px] font-black uppercase tracking-widest">Sincronizando Portfólio</span>
        </div>
      ) : (
        <RoleFilterBar currentFilter={roleFilter} onFilterChange={onRoleFilterChange} t={t} />
      )}

      <button 
        onClick={onCreateClick}
        className="bg-[#081437] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2 shadow-lg active:scale-95 transition-all shrink-0 hover:bg-slate-800"
      >
        <UserPlus size={16} className="text-blue-400" /> Criar Parceiro
      </button>
    </div>
  </div>
);

const RoleFilterBar = ({ currentFilter, onFilterChange, t }: any) => (
  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
    {(['ALL', UserRole.ADMIN, UserRole.QUALITY, UserRole.CLIENT] as const).map(role => (
      <button key={role} onClick={() => onFilterChange(role)} className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${currentFilter === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
        {role === 'ALL' ? 'Todos' : t(`roles.${role}`)}
      </button>
    ))}
  </div>
);

const LoadingUsersState = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-slate-200">
    <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
    <p className="font-black text-[10px] uppercase tracking-[4px] text-slate-400">Autenticando Permissões...</p>
  </div>
);

const EmptyUsersState = ({ isRestricted }: { isRestricted: boolean }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-slate-200 text-center p-8">
    <UsersIcon size={40} className="text-slate-200 mb-4" />
    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Sua carteira está vazia</h3>
  </div>
);
