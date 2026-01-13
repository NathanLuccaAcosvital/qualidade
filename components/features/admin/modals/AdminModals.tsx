

import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Loader2, Info, FolderPlus } from 'lucide-react';
import { User, ClientOrganization, UserRole, MaintenanceEvent } from '../../../../types.ts';
import { useTranslation } from 'react-i18next';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    editingUser: User | null;
    formData: any;
    setFormData: (data: any) => void;
    organizations: ClientOrganization[]; // ALTERADO: clients para organizations
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editingUser, formData, setFormData, organizations }) => { // ALTERADO: clients para organizations
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 id="user-modal-title" className="font-bold text-slate-800">{editingUser ? t('admin.users.editTitle') : t('admin.users.createTitle')}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true"/></button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4 bg-white">
                    <div className="space-y-1">
                        <label htmlFor="user-name" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.name')}</label>
                        <input id="user-name" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} aria-label={t('admin.users.name')} />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="user-email" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.email')}</label>
                        <input id="user-email" type="email" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} aria-label={t('admin.users.email')} />
                    </div>

                    {!editingUser && (
                        <div className="space-y-1">
                            <label htmlFor="user-password" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('login.accessPassword')}</label>
                            <input 
                                id="user-password"
                                type="password" 
                                required 
                                className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                placeholder={t('signup.passwordPlaceholder')} 
                                minLength={6}
                                aria-label={t('login.accessPassword')}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="user-role" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.roleLabel')}</label>
                            <select id="user-role" className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} aria-label={t('admin.users.roleLabel')}>
                                <option value={UserRole.CLIENT}>{t('roles.CLIENT')}</option>
                                <option value={UserRole.QUALITY}>{t('roles.QUALITY')}</option>
                                <option value={UserRole.ADMIN}>{t('roles.ADMIN')}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="user-department" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.department')}</label>
                            <input id="user-department" className="w-full px-4 py-2.5 rounded-lg font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} aria-label={t('admin.users.department')} />
                        </div>
                    </div>
                    {formData.role === UserRole.CLIENT && (
                        <div className="space-y-1">
                            <label htmlFor="user-org-link" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('admin.users.orgLink')}</label>
                            <select id="user-org-link" className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={formData.organizationId} onChange={e => setFormData({...formData, organizationId: e.target.value})} aria-label={t('admin.users.orgLink')}> {/* ALTERADO: clientId para organizationId */}
                                <option value="">{t('common.all')}</option>
                                {organizations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)} {/* ALTERADO: clients para organizations */}
                            </select>
                        </div>
                    )}
                    {/* NOVO: Campo de Status do Usuário */}
                    <div className="space-y-1">
                        <label htmlFor="user-status" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('common.status')}</label>
                        <select id="user-status" className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'BLOCKED'})} aria-label={t('common.status')}>
                            <option value="ACTIVE">{t('common.statusActive')}</option>
                            <option value="BLOCKED">{t('common.statusBlocked')}</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors" aria-label={t('common.cancel')}>{t('common.cancel')}</button>
                        <button type="submit" className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg" aria-label={t('common.save')}>{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    editingClient: ClientOrganization | null;
    clientFormData: any;
    setClientFormData: (data: any) => void;
    qualityAnalysts: User[];
    onDelete?: (clientId: string) => void; // Torna onDelete opcional
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, editingClient, clientFormData, setClientFormData, qualityAnalysts, onDelete }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="client-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 id="client-modal-title" className="font-bold text-slate-800">{editingClient ? t('admin.clients.editTitle') : t('admin.clients.createTitle')}</h3> 
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true"/></button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4 bg-white">
                    <div className="space-y-1">
                        <label htmlFor="client-name" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('dashboard.organization')}</label>
                        <input id="client-name" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.name} onChange={e => setClientFormData({...clientFormData, name: e.target.value})} aria-label={t('dashboard.organization')} />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="client-cnpj" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('dashboard.fiscalID')}</label>
                        <input id="client-cnpj" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.cnpj} onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} aria-label={t('dashboard.fiscalID')} />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="quality-analyst" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Analista de Qualidade Responsável</label>
                        <select 
                            id="quality-analyst" 
                            required 
                            className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" 
                            value={clientFormData.qualityAnalystId} 
                            onChange={e => setClientFormData({...clientFormData, qualityAnalystId: e.target.value})} 
                            aria-label="Analista de Qualidade Responsável"
                        >
                            <option value="">{t('signup.select')}</option>
                            {qualityAnalysts.map(analyst => (
                                <option key={analyst.id} value={analyst.id}>{analyst.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="client-contract-date" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('dashboard.contractDate')}</label> 
                            <input id="client-contract-date" type="date" required className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.contractDate} onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})} aria-label={t('dashboard.contractDate')} />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="client-status" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('common.status')}</label>
                            <select id="client-status" className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.status} onChange={e => setClientFormData({...clientFormData, status: e.target.value})} aria-label={t('common.status')}>
                                <option value="ACTIVE">{t('common.statusActive')}</option>
                                <option value="INACTIVE">{t('common.statusInactive')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors" aria-label={t('common.cancel')}>{t('common.cancel')}</button>
                        <button type="submit" className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg" aria-label={t('common.save')}>{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ScheduleMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<MaintenanceEvent> & { scheduledTime: string }) => Promise<void>;
    isSaving: boolean;
}

export const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({ isOpen, onClose, onSave, isSaving }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        scheduledDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        scheduledTime: '08:00', // HH:MM
        durationMinutes: 60,
        predefinedMessage: 'none',
        customObservation: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                title: '',
                scheduledDate: new Date().toISOString().split('T')[0],
                scheduledTime: '08:00',
                durationMinutes: 60,
                predefinedMessage: 'none',
                customObservation: ''
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    const getFullDescription = () => {
        let description = '';
        if (formData.predefinedMessage !== 'none') {
            description = t(`maintenanceSchedule.predefined.${formData.predefinedMessage}`);
        }
        if (formData.customObservation.trim()) {
            description += (description ? ' - ' : '') + formData.customObservation.trim();
        }
        return description || t('maintenance.scheduledDefaultMessage');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="schedule-maintenance-title">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 id="schedule-maintenance-title" className="font-bold text-slate-800 flex items-center gap-2">
                        <CalendarClock size={20} className="text-orange-600" aria-hidden="true" /> {t('maintenanceSchedule.title')}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="space-y-1">
                        <label htmlFor="event-title" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.eventTitle')}</label>
                        <input 
                            id="event-title" 
                            required 
                            className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            placeholder={t('maintenanceSchedule.eventTitlePlaceholder')}
                            aria-label={t('maintenanceSchedule.eventTitle')} 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="scheduled-date" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.date')}</label>
                            <input 
                                id="scheduled-date" 
                                type="date" 
                                required 
                                className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" 
                                value={formData.scheduledDate} 
                                onChange={e => setFormData({...formData, scheduledDate: e.target.value})} 
                                aria-label={t('maintenanceSchedule.date')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="scheduled-time" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.time')}</label>
                            <input 
                                id="scheduled-time" 
                                type="time" 
                                required 
                                className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" 
                                value={formData.scheduledTime} 
                                onChange={e => setFormData({...formData, scheduledTime: e.target.value})} 
                                aria-label={t('maintenanceSchedule.time')}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="duration-minutes" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.duration')}</label>
                        <input 
                            id="duration-minutes" 
                            type="number" 
                            required 
                            min="1"
                            className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" 
                            value={formData.durationMinutes} 
                            onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} 
                            aria-label={t('maintenanceSchedule.duration')}
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="predefined-message" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.predefinedMessage')}</label>
                        <select 
                            id="predefined-message" 
                            className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" 
                            value={formData.predefinedMessage} 
                            onChange={e => setFormData({...formData, predefinedMessage: e.target.value})} 
                            aria-label={t('maintenanceSchedule.predefinedMessage')}
                        >
                            <option value="none">{t('maintenanceSchedule.predefined.none')}</option>
                            <option value="criticalUpdate">{t('maintenanceSchedule.predefined.criticalUpdate')}</option>
                            <option value="routineMaintenance">{t('maintenanceSchedule.predefined.routineMaintenance')}</option>
                            <option value="securityPatch">{t('maintenanceSchedule.predefined.securityPatch')}</option>
                            <option value="infraUpgrade">{t('maintenanceSchedule.predefined.infraUpgrade')}</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="custom-observation" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.customMessage')}</label>
                        <textarea 
                            id="custom-observation" 
                            className="w-full px-4 py-2.5 rounded-lg font-semibold text-slate-900 bg-slate-50 border border-slate-300 h-24 resize-y" 
                            value={formData.customObservation} 
                            onChange={e => setFormData({...formData, customObservation: e.target.value})} 
                            placeholder={getFullDescription()}
                            aria-label={t('maintenanceSchedule.customMessage')}
                        />
                         <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                            <Info size={12}/> A mensagem final será: " {getFullDescription()} "
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors" aria-label={t('common.cancel')}>{t('common.cancel')}</button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="px-8 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            aria-label={t('maintenanceSchedule.scheduleButton')}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} aria-hidden="true"/> : <CalendarClock size={18} aria-hidden="true"/>} 
                            {t('maintenanceSchedule.scheduleButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    isSaving: boolean;
    folderName: string;
    setFolderName: (name: string) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isOpen, onClose, onSave, isSaving, folderName, setFolderName }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="create-folder-title">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 id="create-folder-title" className="font-bold text-slate-800 flex items-center gap-2">
                        <FolderPlus size={20} className="text-blue-600" aria-hidden="true" /> {t('quality.createFolderTitle')}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true"/></button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4 bg-white">
                    <div className="space-y-1">
                        <label htmlFor="folder-name" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('quality.folderName')}</label>
                        <input 
                            id="folder-name" 
                            required 
                            className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" 
                            value={folderName} 
                            onChange={e => setFolderName(e.target.value)} 
                            aria-label={t('quality.folderName')} 
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors" aria-label={t('common.cancel')}>{t('common.cancel')}</button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            aria-label={t('quality.createFolderButton')}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} aria-hidden="true"/> : <FolderPlus size={18} aria-hidden="true"/>} 
                            {t('quality.createFolderButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
