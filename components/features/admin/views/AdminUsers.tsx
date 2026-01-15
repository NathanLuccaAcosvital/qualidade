
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import { UserList } from '../components/UserList.tsx';
import { UserModal } from '../components/AdminModals.tsx';
import { useAdminUserManagement } from '../hooks/useAdminUserManagement.ts';
import { UserRole } from '../../../../types/index.ts';

interface AdminUsersProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * AdminUsers View (Orchestrator)
 */
export const AdminUsers: React.FC<AdminUsersProps> = ({ setIsSaving }) => {
  const { t } = useTranslation();
  const management = useAdminUserManagement({ setIsSaving });

  return (
    <div className="space-y-6">
      <UserModal
        isOpen={management.isUserModalOpen}
        onClose={() => management.setIsUserModalOpen(false)}
        onSave={management.handleSaveUser}
        editingUser={management.editingUser}
        formData={management.formData}
        setFormData={management.setFormData}
        organizations={management.clientsList}
      />

      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
        <UsersControlPanel 
          searchTerm={management.searchTerm}
          onSearchChange={management.setSearchTerm}
          roleFilter={management.roleFilter}
          onRoleFilterChange={management.setRoleFilter}
          onCreateClick={() => management.openUserModal()}
          t={t}
        />
      </div>

      {management.isLoadingUsers ? (
        <LoadingUsersState />
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          <UserList 
            users={management.filteredUsers} 
            onEdit={management.openUserModal} 
          />
        </div>
      )}
    </div>
  );
};

/* --- Sub-componentes Especializados (SRP) --- */

const UsersControlPanel = ({ searchTerm, onSearchChange, roleFilter, onRoleFilterChange, onCreateClick, t }: any) => (
  <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4 w-full sticky top-20 z-20 backdrop-blur-md bg-white/90">
    <div className="relative w-full max-w-xl group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-detail-blue)] transition-colors" size={20} />
      <input
        type="text"
        placeholder="Identidade, e-mail ou departamento..."
        className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm w-full outline-none focus:ring-4 focus:ring-[var(--color-detail-blue)]/10 focus:bg-white focus:border-[var(--color-detail-blue)] transition-all font-medium"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
      />
    </div>

    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
      <RoleFilterBar 
        currentFilter={roleFilter} 
        onFilterChange={onRoleFilterChange} 
        t={t} 
      />

      <div className="h-10 w-px bg-slate-100 hidden lg:block mx-2" />

      <button 
        onClick={onCreateClick}
        className="bg-[var(--color-primary-dark-blue)] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[3px] flex items-center gap-3 shadow-xl shadow-[var(--color-primary-dark-blue)]/20 active:scale-95 transition-all shrink-0 hover:bg-slate-800"
      >
        <UserPlus size={18} className="text-[var(--color-detail-blue)]" /> Criar Acesso
      </button>
    </div>
  </div>
);

const RoleFilterBar = ({ currentFilter, onFilterChange, t }: any) => (
  <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl">
    {(['ALL', UserRole.ADMIN, UserRole.QUALITY] as const).map(role => (
      <button
        key={role}
        onClick={() => onFilterChange(role)}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
          currentFilter === role ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {role === 'ALL' ? 'Todos' : t(`roles.${role}`)}
      </button>
    ))}
  </div>
);

const LoadingUsersState = () => (
  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
    <div className="relative mb-6">
      <Loader2 size={56} className="animate-spin text-[var(--color-detail-blue)]" />
      <ShieldCheck size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-primary-dark-blue)]" />
    </div>
    <p className="font-black text-[10px] uppercase tracking-[6px] text-slate-400">Validando Base Cadastral...</p>
  </div>
);
