
import React from 'react';
import { X } from 'lucide-react';
import { User, ClientOrganization, UserRole } from '../../../../types.ts';
import { useTranslation } from 'react-i18next';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    editingUser: User | null;
    formData: any;
    setFormData: (data: any) => void;
    clients: ClientOrganization[];
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editingUser, formData, setFormData, clients }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">{editingUser ? t('admin.users.editTitle') : t('admin.users.createTitle')}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4 bg-white">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.name')}</label>
                        <input required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.email')}</label>
                        <input type="email" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>

                    {!editingUser && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Senha Inicial</label>
                            <input 
                                type="password" 
                                required 
                                className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                placeholder="Defina a senha (mín. 6 caracteres)"
                                minLength={6}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.roleLabel')}</label>
                            <select className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                                <option value={UserRole.CLIENT}>{t('roles.CLIENT')}</option>
                                <option value={UserRole.QUALITY}>{t('roles.QUALITY')}</option>
                                <option value={UserRole.ADMIN}>{t('roles.ADMIN')}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.department')}</label>
                            <input className="w-full px-4 py-2.5 rounded-lg font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                        </div>
                    </div>
                    {formData.role === UserRole.CLIENT && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.orgLink')}</label>
                            <select className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                                <option value="">{t('common.all')}</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ClientModal: React.FC<any> = ({ isOpen, onClose, onSave, editingClient, clientFormData, setClientFormData }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">{editingClient ? 'Editar Organização' : 'Nova Organização'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4 bg-white">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Razão Social</label>
                        <input required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.name} onChange={e => setClientFormData({...clientFormData, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">CNPJ</label>
                        <input required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.cnpj} onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Data Contrato</label>
                            <input type="date" required className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.contractDate} onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Status</label>
                            <select className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.status} onChange={e => setClientFormData({...clientFormData, status: e.target.value})}>
                                <option value="ACTIVE">Ativo</option>
                                <option value="INACTIVE">Inativo</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
