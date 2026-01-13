import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Loader2, Info, FolderPlus } from 'lucide-react';
// Fix: Updated import path for 'types' module to explicitly include '/index'
import { User, ClientOrganization, UserRole, MaintenanceEvent } from '../../../types/index';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/authContext.tsx'; // Added useAuth for client modal confirmation

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    editingUser: User | null;
    formData: any;
    setFormData: (data: any) => void;
    organizations: ClientOrganization[];
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editingUser, formData, setFormData, organizations }) => {
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
                            <select id="user-org-link" className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={formData.organizationId} onChange={e => setFormData({...formData, organizationId: e.target.value})} aria-label={t('admin.users.orgLink')}>
                                <option value="">{t('common.all')}</option>
                                {organizations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
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
    // Fix: Changed onSave signature to optionally accept confirmation credentials
    onSave: (e: React.FormEvent, confirmEmail?: string, confirmPassword?: string) => Promise<void>;
    editingClient: ClientOrganization | null;
    clientFormData: any;
    setClientFormData: (data: any) => void;
    qualityAnalysts: User[];
    onDelete?: (clientId: string) => void;
    requiresConfirmation?: boolean; // New prop to control confirmation fields
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, editingClient, clientFormData, setClientFormData, qualityAnalysts, onDelete, requiresConfirmation = false }) => {
    const { t } = useTranslation();
    const { user } = useAuth(); // Access current user for confirmation check
    const [confirmEmail, setConfirmEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!isOpen) { // Reset confirmation fields on close
            setConfirmEmail('');
            setConfirmPassword('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (requiresConfirmation) {
            await onSave(e, confirmEmail, confirmPassword);
        } else {
            await onSave(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="client-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 id="client-modal-title" className="font-bold text-slate-800">{editingClient ? t('admin.clients.editTitle') : t('admin.clients.createTitle')}</h3> 
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="space-y-1">
                        <label htmlFor="client-name" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('dashboard.organization')}</label>
                        <input id="client-name" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.name} onChange={e => setClientFormData({...clientFormData, name: e.target.value})} aria-label={t('dashboard.organization')} />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="client-cnpj" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('dashboard.fiscalID')}</label>
                        <input id="client-cnpj" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.cnpj} onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} aria-label={t('dashboard.fiscalID')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="client-contract-date" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('dashboard.contractDate')}</label>
                            <input id="client-contract-date" type="date" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.contractDate} onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})} aria-label={t('dashboard.contractDate')} />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="client-status" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('common.status')}</label>
                            <select id="client-status" className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.status} onChange={e => setClientFormData({...clientFormData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})} aria-label={t('common.status')}>
                                <option value="ACTIVE">{t('common.statusActive')}</option>
                                <option value="INACTIVE">{t('common.statusInactive')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="quality-analyst" className="text-xs font-bold text-slate-600 uppercase tracking-wide">Analista de Qualidade</label>
                        <select id="quality-analyst" className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={clientFormData.qualityAnalystId} onChange={e => setClientFormData({...clientFormData, qualityAnalystId: e.target.value})} aria-label="Analista de Qualidade">
                            <option value="">{t('common.na')}</option>
                            {qualityAnalysts.map(qa => <option key={qa.id} value={qa.id}>{qa.name}</option>)}
                        </select>
                    </div>

                    {requiresConfirmation && (
                        <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100 space-y-3 mt-4 animate-in slide-in-from-top-2">
                            <h4 className="font-bold flex items-center gap-2"><Info size={16} /> {t('quality.confirmActionTitle')}</h4>
                            <p className="text-xs text-blue-600">Para sua segurança, por favor, confirme suas credenciais para salvar alterações críticas da empresa.</p>
                            <div className="space-y-1">
                                <label htmlFor="confirm-email" className="text-xs font-bold uppercase">{t('quality.confirmEmailLabel')}</label>
                                <input
                                    id="confirm-email"
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    value={confirmEmail}
                                    onChange={e => setConfirmEmail(e.target.value)}
                                    aria-label={t('quality.confirmEmailLabel')}
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="confirm-password" className="text-xs font-bold uppercase">{t('quality.confirmPasswordLabel')}</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    aria-label={t('quality.confirmPasswordLabel')}
                                />
                            </div>
                        </div>
                    )}

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
    onSave: (eventData: Partial<MaintenanceEvent> & { scheduledTime: string }) => Promise<void>;
    isSaving: boolean;
}

export const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({ isOpen, onClose, onSave, isSaving }) => {
    const { t } = useTranslation();
    const [eventTitle, setEventTitle] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [description, setDescription] = useState('');
    const [predefinedMessage, setPredefinedMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Set default date to today, default time to 1 hour from now
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            setScheduledDate(now.toISOString().split('T')[0]);
            setScheduledTime(oneHourLater.toTimeString().split(':')[0] + ':' + oneHourLater.toTimeString().split(':')[1]);
            setEventTitle('');
            setDurationMinutes(60);
            setDescription('');
            setPredefinedMessage('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (predefinedMessage && predefinedMessage !== 'none') {
            setDescription(t(`maintenanceSchedule.predefined.${predefinedMessage}`));
        } else if (predefinedMessage === 'none') {
            setDescription('');
        }
    }, [predefinedMessage, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventTitle.trim() || !scheduledDate || !scheduledTime || durationMinutes <= 0) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        await onSave({
            title: eventTitle,
            scheduledDate,
            scheduledTime,
            durationMinutes,
            description: description.trim() || undefined,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="schedule-maintenance-title">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 id="schedule-maintenance-title" className="font-bold text-slate-800 flex items-center gap-2">
                        <CalendarClock size={20} className="text-blue-600" aria-hidden="true" /> {t('maintenanceSchedule.title')}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
                    <div className="space-y-1">
                        <label htmlFor="event-title" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.eventTitle')}</label>
                        <input id="event-title" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder={t('maintenanceSchedule.eventTitlePlaceholder')} aria-label={t('maintenanceSchedule.eventTitle')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="scheduled-date" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.date')}</label>
                            <input id="scheduled-date" type="date" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} aria-label={t('maintenanceSchedule.date')} />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="scheduled-time" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.time')}</label>
                            <input id="scheduled-time" type="time" required className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} aria-label={t('maintenanceSchedule.time')} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="duration-minutes" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.duration')}</label>
                        <input id="duration-minutes" type="number" required min="1" className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300" value={durationMinutes} onChange={e => setDurationMinutes(parseInt(e.target.value))} aria-label={t('maintenanceSchedule.duration')} />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="predefined-message" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.predefinedMessage')}</label>
                        <select id="predefined-message" className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300" value={predefinedMessage} onChange={e => setPredefinedMessage(e.target.value)} aria-label={t('maintenanceSchedule.predefinedMessage')}>
                            <option value="none">{t('maintenanceSchedule.predefined.none')}</option>
                            <option value="criticalUpdate">{t('maintenanceSchedule.predefined.criticalUpdate')}</option>
                            <option value="routineMaintenance">{t('maintenanceSchedule.predefined.routineMaintenance')}</option>
                            <option value="securityPatch">{t('maintenanceSchedule.predefined.securityPatch')}</option>
                            <option value="infraUpgrade">{t('maintenanceSchedule.predefined.infraUpgrade')}</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="description" className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('maintenanceSchedule.customMessage')}</label>
                        <textarea id="description" rows={3} className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300 resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes adicionais ou mensagem customizada para usuários." aria-label={t('maintenanceSchedule.customMessage')}></textarea>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors" aria-label={t('common.cancel')}>{t('common.cancel')}</button>
                        <button type="submit" disabled={isSaving} className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2" aria-label={t('maintenanceSchedule.scheduleButton')}>
                            {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : t('maintenanceSchedule.scheduleButton')}
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="create-folder-modal-title">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 id="create-folder-modal-title" className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FolderPlus size={20} className="text-blue-600" aria-hidden="true" /> {t('quality.createFolderTitle')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label={t('common.close')}><X size={20} aria-hidden="true" /></button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="folder-name" className="text-xs font-bold text-slate-500 uppercase">{t('quality.folderName')}</label>
            <input
              id="folder-name"
              type="text"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minha Nova Pasta"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              aria-label={t('quality.folderName')}
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all" aria-label={t('common.cancel')}>{t('common.cancel')}</button>
            <button
              type="submit"
              disabled={isSaving || !folderName.trim()}
              className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
              aria-label={t('quality.createFolderButton')}
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : t('quality.createFolderButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};