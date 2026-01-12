
import React, { useState } from 'react';
import { User, UserRole } from '../../../types.ts';
import { MoreVertical, Edit2, Trash2, Mail, Building2, Briefcase, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete?: (user: User) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isActive = status === 'ACTIVE';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isActive ? 'Ativo' : 'Bloqueado'}
        </span>
    );
};

export const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.identity')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.role')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Departamento</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Organização / Empresa</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Acesso</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.status')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shrink-0 shadow-sm">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 text-sm whitespace-nowrap truncate">{u.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{u.email || 'E-mail não vinculado'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${
                                        u.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                        u.role === UserRole.QUALITY ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                        {t(`roles.${u.role}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Briefcase size={14} className="text-slate-400" />
                                        <span className="text-xs font-medium">{u.department || 'Geral'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Building2 size={14} className="text-slate-400" />
                                        <span className="text-xs font-semibold">{u.clientId}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-mono">{u.lastLogin || 'Nunca'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={u.status || 'ACTIVE'} />
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === u.id ? null : u.id); }}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    {activeDropdown === u.id && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                                            <div className="absolute right-8 top-12 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                                <button 
                                                    onClick={() => { onEdit(u); setActiveDropdown(null); }}
                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <Edit2 size={16} className="text-blue-500" /> {t('common.edit')}
                                                </button>
                                                <button 
                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <Mail size={16} className="text-indigo-500" /> Reenviar Acesso
                                                </button>
                                                {onDelete && (
                                                    <button 
                                                        onClick={() => { onDelete(u); setActiveDropdown(null); }}
                                                        className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-slate-50 transition-colors"
                                                    >
                                                        <Trash2 size={16} /> Remover Usuário
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic">
                                    Nenhum usuário encontrado na base de dados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
