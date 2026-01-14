import React, { useState } from 'react';
import { User, UserRole, AccountStatus } from '../../../../types/index.ts';
import { MoreVertical, Edit2, Building2, Briefcase, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
}

/**
 * Tabela de Gestão de Usuários (Orquestrador)
 * (S) Responsabilidade: Gerenciar o estado de exibição da lista e dropdowns.
 */
export const UserList: React.FC<UserListProps> = ({ users, onEdit }) => {
  const { t } = useTranslation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(current => current === id ? null : id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.identity')}</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.role')}</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.department')}</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Vínculo Corporativo</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Último Acesso</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.status')}</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
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

/* --- Sub-componentes Especializados (SRP + Clean Code) --- */

// DO: Explicitly typing as React.FC to handle 'key' prop correctly in list iterations
const UserRow: React.FC<{ 
  user: User, isDropdownOpen: boolean, onToggleDropdown: () => void, onEdit: () => void 
}> = ({ user, isDropdownOpen, onToggleDropdown, onEdit }) => {
  const { t } = useTranslation();
  
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email || t('common.na')}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-6 py-4 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <Briefcase size={12} className="text-slate-400" />
          {user.department || t('common.na')}
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-bold text-slate-700">
        <div className="flex items-center gap-2">
          <Building2 size={12} className="text-slate-400" />
          {user.organizationName || t('common.na')}
        </div>
      </td>
      <td className="px-6 py-4 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Clock size={12} />
          {user.lastLogin || t('common.na')}
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={user.status} />
      </td>
      <td className="px-6 py-4 text-right relative">
        <button 
          onClick={onToggleDropdown} 
          className={`p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all ${isDropdownOpen ? 'bg-slate-100 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <MoreVertical size={16} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-6 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 animate-in zoom-in-95 duration-150">
            <button 
              onClick={onEdit} 
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Edit2 size={14} className="text-blue-500" /> {t('common.edit')}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

/**
 * Mapeamento de variantes de Role (OCP)
 */
const ROLE_VARIANTS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-purple-50 text-purple-700 border-purple-100',
  [UserRole.QUALITY]: 'bg-blue-50 text-blue-700 border-blue-100',
  [UserRole.CLIENT]: 'bg-slate-50 text-slate-600 border-slate-200'
};

const RoleBadge = ({ role }: { role: UserRole }) => {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${ROLE_VARIANTS[role] || ROLE_VARIANTS[UserRole.CLIENT]}`}>
      {t(`roles.${role}`)}
    </span>
  );
};

// Fix: Updated status prop to use canonical AccountStatus enum
const StatusBadge = ({ status }: { status?: AccountStatus }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
    status === AccountStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === AccountStatus.ACTIVE ? 'bg-emerald-500' : 'bg-red-500'}`} />
    {status === AccountStatus.ACTIVE ? 'ATIVO' : status === AccountStatus.BLOCKED ? 'BLOQUEADO' : 'INATIVO'}
  </span>
);