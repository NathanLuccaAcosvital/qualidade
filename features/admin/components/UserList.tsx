import React, { useState } from 'react';
import { User, UserRole } from '../../../types/index';
import { MoreVertical, Edit2, Trash2, Mail, Building2, Briefcase, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete?: (user: User) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const { t } = useTranslation();
    const isActive = status === 'ACTIVE';
    const statusText = isActive ? t('common.statusActive') : t('common.statusBlocked');
    const bgColor = isActive ? 'bg-emerald-50' : 'bg-red-50';
    const textColor = isActive ? 'text-emerald-600' : 'text-red-600';
    const borderColor = isActive ? 'border-emerald-100' : 'border-red-100';
    const dotColor = isActive ? 'bg-emerald-500' : 'bg-red-500';

    return (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${bgColor} ${textColor} ${borderColor}`}
          aria-label={statusText}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
            {statusText}
        </span>
    );
};

export const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]" role="table" aria-label={t('admin.tabs.users')}>
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr role="row">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.users.identity')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.users.role')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('admin.users.department')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">Organização Vinculada</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">Acesso</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" scope="col">{t('common.status')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" scope="col">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white" role="rowgroup">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors group" role="row">
                                <td className="px-6 py-4" role="cell" data-label={t('admin.users.identity')}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shrink-0 shadow-sm" aria-hidden="true">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 text-sm whitespace-nowrap truncate">{u.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{u.email || t('common.na')}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4" role="cell" data-label={t('admin.users.role')}>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${
                                        u.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                        u.role === UserRole.QUALITY ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        'bg-slate-50 text-slate-600 border-slate-200'
                                    }`} aria-label={t(`roles.${u.role}`)}>
                                        {t(`roles.${u.role}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4" role="cell" data-label={t('admin.users.department')}>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Briefcase size={14} className="text-slate-400" aria-hidden="true" />
                                        <span className="text-xs font-medium">{u.department || t('common.na')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4" role="cell" data-label="Organização Vinculada"> 
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Building2 size={14} className="text-slate-400" aria-hidden="true" />
                                        <span className="text-xs font-semibold">{u.organizationName || t('common.na')}</span> 
                                    </div>
                                </td>
                                <td className="px-6 py-4" role="cell" data-label="Acesso"> 
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock size={14} className="text-slate-400" aria-hidden="true" />
                                        <span className="text-[10px] font-mono">{u.lastLogin || t('common.na')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4" role="cell" data-label={t('common.status')}>
                                    <StatusBadge status={u.status || 'ACTIVE'} />
                                </td>
                                <td className="px-6 py-4 text-right" role="cell">
                                    <div className="relative inline-block text-left">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center w-full rounded-md px-2 py-2 text-sm font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            id={`menu-button-${u.id}`}
                                            aria-expanded={activeDropdown === u.id}
                                            aria-haspopup="true"
                                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === u.id ? null : u.id); }}
                                            aria-label={t('common.moreActions')}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeDropdown === u.id && (
                                            <div
                                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-in fade-in zoom-in-95 duration-200"
                                                role="menu"
                                                aria-orientation="vertical"
                                                aria-labelledby={`menu-button-${u.id}`}
                                                tabIndex={-1}
                                            >
                                                <div className="py-1" role="none">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEdit(u); setActiveDropdown(null); }}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                                        role="menuitem"
                                                        tabIndex={-1}
                                                        id={`menu-item-edit-${u.id}`}
                                                    >
                               