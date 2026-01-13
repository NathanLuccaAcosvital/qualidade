import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { UserList } from '../components/UserList.tsx';
import { UserModal } from '../modals/AdminModals.tsx';
import { useAdminUserManagement } from '../hooks/useAdminUserManagement.ts';

interface AdminUsersProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ setIsSaving }) => {
  const { t } = useTranslation();

  const {
    filteredUsers,
    isLoadingUsers,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    formData,
    setFormData,
    clientsList, // Clients list from the hook
  } = useAdminUserManagement({ setIsSaving });


  return (
    <>
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        organizations={clientsList} // Use clientsList from the hook
      />

      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-xl shadow-sm">
        <div className="relative group w-full sm:w-auto flex-1 max-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input type="text" placeholder={t('common.search')} className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button onClick={() => openUserModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"><UserPlus size={16} /> {t('admin.users.newAccess')}</button>
        </div>
      </div>

      {isLoadingUsers ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200" role="status">
          <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
          <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      ) : (
        <UserList users={filteredUsers} onEdit={openUserModal} />
      )}
    </>
  );
};