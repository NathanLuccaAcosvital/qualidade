import React, { useState } from 'react';
import { User, UserRole, AccountStatus } from '../../../../types/index.ts';
import { MoreVertical, Edit2, Building2, Briefcase, Clock, ShieldAlert, BadgeInfo } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onEdit }) => {
  const { t } = useTranslation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(current => current === id ? null : id);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm animate-in fade-in duration-300">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Identidade</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">Vínculo</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider hidden lg:table-cell">Corporativo</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider hidden md:table-cell">Acesso</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-wider">{t('common.status')}</th>
              <th className="px-4 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <UserRow 
                key={user.id} 
                user={user} 
                isDropdownOpen={activeDropdown === user.id}
                onToggleDropdown={() => toggleDropdown(user.id)}
                onEdit={() => { onEdit(user); setActiveDropdown(null); }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserRow: React.FC<{ 
  user: User, isDropdownOpen: boolean, onToggleDropdown: () => void, onEdit: () => void 
}> = ({ user, isDropdownOpen, onToggleDropdown, onEdit }) => {
  const { t } = useTranslation();
  const isVitalStaff = user.department === 'VITAL_REPRESENTATIVE';
  const isPendingDeletion = user.department === 'PENDING_DELETION';

  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border shadow-sm shrink-0 text-xs ${isVitalStaff ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-xs truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{user.email || t('common.na')}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
            <RoleBadge role={user.role} />
            {isPendingDeletion && (
                <span className="text-[8px] font-black text-red-600 uppercase animate-pulse">Exclusão Pendente</span>
            )}
        </div>
      </td>
      <td className="px-4 py-4 text-xs font-bold text-slate-600 hidden lg:table-cell">
        <div className="flex items-center gap-2 truncate max-w-[180px]">
          <Building2 size={12} className="text-slate-300 shrink-0" />
          <span className="truncate">{user.organizationName || t('common.na')}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-[10px] font-mono text-slate-400 hidden md:table-cell">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : t('common.na')}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={user.status} />
      </td>
      <td className="px-4 py-4 text-right relative">
        <button onClick={onToggleDropdown} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
          <MoreVertical size={14} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-6 top-10 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 animate-in zoom-in-95">
            <button onClick={onEdit} className="w-full flex items-center gap-2 px-4 py-2 text-[11px] text-slate-700 hover:bg-slate-50 font-bold uppercase tracking-wider">
              <Edit2 size={12} className="text-blue-500" /> Gerenciar
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

const ROLE_VARIANTS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-purple-50 text-purple-700 border-purple-100',
  [UserRole.QUALITY]: 'bg-blue-50 text-blue-700 border-blue-100',
  [UserRole.CLIENT]: 'bg-slate-50 text-slate-600 border-slate-200'
};

const RoleBadge = ({ role }: { role: UserRole }) => {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${ROLE_VARIANTS[role] || ROLE_VARIANTS[UserRole.CLIENT]}`}>
      {t(`roles.${role}`)}
    </span>
  );
};

const StatusBadge = ({ status }: { status?: AccountStatus }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
    status === AccountStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
  }`}>
    <span className={`w-1 h-1 rounded-full ${status === AccountStatus.ACTIVE ? 'bg-emerald-500' : 'bg-red-500'}`} />
    {status === AccountStatus.ACTIVE ? 'ATIVO' : 'BLOQ.'}
  </span>
);