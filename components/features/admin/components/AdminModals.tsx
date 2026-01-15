
import React, { useState } from 'react';
import { X, CalendarClock, Loader2, Info, LucideIcon } from 'lucide-react';
import { User, ClientOrganization, UserRole, MaintenanceEvent, AccountStatus } from '../../../../types/index.ts';
import { useTranslation } from 'react-i18next';

/* --- UI Primitives (Clean Code - Interface Segregation) --- */

interface ModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

const ModalFrame: React.FC<ModalFrameProps> = ({ isOpen, onClose, title, children, icon: Icon }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={20} className="text-[var(--color-detail-blue)]" />}
            <h3 className="font-bold text-slate-800">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label="Fechar"><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; id: string; children: React.ReactNode }> = ({ label, id, children }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full px-4 py-2.5 rounded-lg outline-none font-semibold text-slate-900 bg-slate-50 border border-slate-300 focus:border-[var(--color-detail-blue)] focus:bg-white transition-all disabled:opacity-50" />
);

const SelectInput = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="w-full px-4 py-2.5 rounded-lg font-bold text-slate-900 bg-slate-50 border border-slate-300 focus:border-[var(--color-detail-blue)] transition-all" />
);

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  organizationId: string;
  department: string;
  status: AccountStatus;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  editingUser: User | null;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  organizations: ClientOrganization[];
}

export const UserModal: React.FC<UserModalProps> = ({ 
  isOpen, onClose, onSave, editingUser, formData, setFormData, organizations 
}) => {
  const { t } = useTranslation();

  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title={editingUser ? t('admin.users.editTitle') : t('admin.users.createTitle')}>
      <form onSubmit={onSave} className="p-6 space-y-4 bg-white">
        <FormField label={t('admin.users.name')} id="user-name">
          <TextInput 
            id="user-name"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
        </FormField>
        
        <FormField label={t('admin.users.email')} id="user-email">
          <TextInput 
            id="user-email"
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
        </FormField>

        {!editingUser && (
          <FormField label={t('login.accessPassword')} id="user-password">
            <TextInput 
              id="user-password"
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              minLength={6} 
              required 
            />
          </FormField>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label={t('admin.users.roleLabel')} id="user-role">
            <SelectInput 
              id="user-role"
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value={UserRole.CLIENT}>{t('roles.CLIENT')}</option>
              <option value={UserRole.QUALITY}>{t('roles.QUALITY')}</option>
              <option value={UserRole.ADMIN}>{t('roles.ADMIN')}</option>
            </SelectInput>
          </FormField>
          <FormField label={t('admin.users.department')} id="user-department">
            <TextInput 
              id="user-department"
              value={formData.department} 
              onChange={e => setFormData({...formData, department: e.target.value})} 
            />
          </FormField>
        </div>

        <FormField label={t('admin.users.org')} id="user-org">
          <SelectInput 
            id="user-org"
            value={formData.organizationId} 
            onChange={e => setFormData({...formData, organizationId: e.target.value})}
          >
            <option value="">Aços Vital (Interno)</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </SelectInput>
        </FormField>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
          <button type="submit" className="px-8 py-2 bg-[var(--color-primary-dark-blue)] text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">{t('common.save')}</button>
        </div>
      </form>
    </ModalFrame>
  );
};

export interface ClientFormData {
  name: string;
  cnpj: string;
  contractDate: string;
  status: AccountStatus;
  qualityAnalystId: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent, confirmEmail?: string, confirmPassword?: string) => Promise<void>;
  editingClient: ClientOrganization | null;
  clientFormData: ClientFormData;
  setClientFormData: (data: ClientFormData) => void;
  qualityAnalysts: User[];
  requiresConfirmation?: boolean;
}

export const ClientModal: React.FC<ClientModalProps> = ({ 
  isOpen, onClose, onSave, editingClient, clientFormData, setClientFormData, qualityAnalysts, requiresConfirmation = false 
}) => {
  const { t } = useTranslation();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    requiresConfirmation ? await onSave(e, confirmEmail, confirmPassword) : await onSave(e);
  };

  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title={editingClient ? t('admin.clients.editTitle') : t('admin.clients.createTitle')}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
        <FormField label={t('dashboard.organization')} id="client-name">
          <TextInput 
            id="client-name"
            value={clientFormData.name} 
            onChange={e => setClientFormData({...clientFormData, name: e.target.value})} 
            required 
          />
        </FormField>

        <FormField label={t('dashboard.fiscalID')} id="client-cnpj">
          <TextInput 
            id="client-cnpj"
            value={clientFormData.cnpj} 
            onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} 
            required 
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={t('dashboard.contractDate')} id="client-date">
            <TextInput 
              id="client-date"
              type="date" 
              value={clientFormData.contractDate} 
              onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})} 
              required 
            />
          </FormField>
          <FormField label={t('common.status')} id="client-status">
            <SelectInput 
              id="client-status"
              value={clientFormData.status} 
              onChange={e => setClientFormData({...clientFormData, status: e.target.value as AccountStatus})}
            >
              <option value={AccountStatus.ACTIVE}>{t('common.statusActive')}</option>
              <option value={AccountStatus.INACTIVE}>{t('common.statusInactive')}</option>
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Analista de Qualidade" id="qa-assign">
          <SelectInput 
            id="qa-assign"
            value={clientFormData.qualityAnalystId} 
            onChange={e => setClientFormData({...clientFormData, qualityAnalystId: e.target.value})}
          >
            <option value="">{t('common.na')}</option>
            {qualityAnalysts.map(qa => <option key={qa.id} value={qa.id}>{qa.name}</option>)}
          </SelectInput>
        </FormField>

        {requiresConfirmation && (
          <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100 space-y-3 mt-4">
            <h4 className="font-bold flex items-center gap-2"><Info size={16} /> Confirmar Ação</h4>
            <TextInput 
              type="email" 
              placeholder="E-mail de confirmação" 
              value={confirmEmail} 
              onChange={e => setConfirmEmail(e.target.value)} 
              required 
            />
            <TextInput 
              type="password" 
              placeholder="Sua senha" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
          <button type="submit" className="px-8 py-2 bg-[var(--color-primary-dark-blue)] text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">{t('common.save')}</button>
        </div>
      </form>
    </ModalFrame>
  );
};

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<MaintenanceEvent> & { scheduledTime: string }) => Promise<void>;
  isSaving: boolean;
}

export const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({ 
  isOpen, onClose, onSave, isSaving 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: 60,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title={t('maintenanceSchedule.title')} icon={CalendarClock}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
        <FormField label={t('maintenanceSchedule.eventTitle')} id="m-title">
          <TextInput 
            id="m-title"
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder={t('maintenanceSchedule.eventTitlePlaceholder')}
            required 
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label={t('maintenanceSchedule.date')} id="m-date">
            <TextInput 
              id="m-date"
              type="date" 
              value={formData.scheduledDate} 
              onChange={e => setFormData({...formData, scheduledDate: e.target.value})} 
              required 
            />
          </FormField>
          <FormField label={t('maintenanceSchedule.time')} id="m-time">
            <TextInput 
              id="m-time"
              type="time" 
              value={formData.scheduledTime} 
              onChange={e => setFormData({...formData, scheduledTime: e.target.value})} 
              required 
            />
          </FormField>
        </div>

        <FormField label={t('maintenanceSchedule.duration')} id="m-duration">
          <TextInput 
            id="m-duration"
            type="number" 
            value={formData.durationMinutes.toString()} 
            onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})} 
            required 
          />
        </FormField>

        <FormField label={t('maintenanceSchedule.customMessage')} id="m-desc">
          <textarea 
            id="m-desc"
            className="w-full px-4 py-2.5 rounded-lg font-medium text-slate-900 bg-slate-50 border border-slate-300 focus:border-[var(--color-detail-blue)] focus:bg-white transition-all min-h-[100px] outline-none"
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
        </FormField>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
          <button type="submit" disabled={isSaving} className="px-8 py-2 bg-[var(--color-primary-dark-blue)] text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {t('maintenanceSchedule.scheduleButton')}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};
