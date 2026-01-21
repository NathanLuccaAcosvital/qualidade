
import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Loader2, Info, LucideIcon, ShieldAlert, UserCheck, Save, Trash2 } from 'lucide-react';
import { User, ClientOrganization, UserRole, MaintenanceEvent, AccountStatus } from '../../../../types/index.ts';
import { useTranslation } from 'react-i18next';

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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                {Icon ? <Icon size={22} /> : <UserCheck size={22} />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label="Fechar"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; id: string; children: React.ReactNode; required?: boolean }> = ({ label, id, children, required }) => (
  <div className="space-y-1.5 px-8 pt-5">
    <label htmlFor={id} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50" />
);

const SelectInput = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="w-full px-4 py-3 rounded-xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50" />
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
  onFlagDeletion?: (userId: string) => Promise<void>;
  editingUser: User | null;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  organizations: ClientOrganization[];
  isSaving?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({ 
  isOpen, onClose, onSave, onFlagDeletion, editingUser, formData, setFormData, organizations, isSaving = false 
}) => {
  const { t } = useTranslation();

  return (
    <ModalFrame isOpen={isOpen} onClose={onClose} title={editingUser ? "Gerenciar Acesso" : "Novo Credenciamento"}>
      <form onSubmit={onSave} className="pb-4">
        <FormField label="Nome Completo" id="user-name" required>
          <TextInput 
            id="user-name"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            placeholder="Ex: João Silva"
            required 
            disabled={isSaving}
          />
        </FormField>
        
        <FormField label="E-mail Corporativo" id="user-email" required>
          <TextInput 
            id="user-email"
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            placeholder="usuario@empresa.com"
            required 
            disabled={!!editingUser || isSaving}
          />
        </FormField>

        {!editingUser && (
          <FormField label="Senha Temporária" id="user-password" required>
            <TextInput 
              id="user-password"
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              placeholder="Mínimo 6 caracteres"
              minLength={6} 
              required 
              disabled={isSaving}
            />
          </FormField>
        )}

        <div className="grid grid-cols-2 gap-0">
          <FormField label="Nível de Permissão" id="user-role">
            <SelectInput 
              id="user-role"
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
              disabled={isSaving}
            >
              <option value={UserRole.CLIENT}>Acesso Cliente</option>
              <option value={UserRole.QUALITY}>Analista Qualidade</option>
              <option value={UserRole.ADMIN}>Administrador</option>
            </SelectInput>
          </FormField>

          <FormField label="Natureza do Vínculo" id="user-type">
            <SelectInput 
              id="user-type"
              value={formData.department} 
              onChange={e => setFormData({...formData, department: e.target.value})}
              disabled={isSaving}
            >
              <option value="CLIENT_INTERNAL">Equipe do Cliente</option>
              <option value="VITAL_REPRESENTATIVE">Funcionário Vital (Representante)</option>
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Empresa de Atuação" id="user-org">
          <SelectInput 
            id="user-org"
            value={formData.organizationId} 
            onChange={e => setFormData({...formData, organizationId: e.target.value})}
            disabled={isSaving}
          >
            <option value="">Aços Vital (Sede Interna)</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </SelectInput>
        </FormField>

        {editingUser && (
           <div className="mx-8 mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={14} /> Zona de Governança
              </p>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                A exclusão é desativada por auditoria. Você pode sinalizar o usuário para desligamento.
              </p>
              <button 
                type="button"
                disabled={isSaving}
                onClick={() => onFlagDeletion && onFlagDeletion(editingUser.id)}
                className="w-full py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Sinalizar para Exclusão
              </button>
           </div>
        )}

        <div className="mt-8 px-8 py-6 sticky bottom-0 bg-white border-t border-slate-100 flex justify-end gap-3 z-10 shadow-[0_-10px_20px_rgba(255,255,255,0.8)]">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSaving}
            className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-10 py-3 bg-[#081437] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingUser ? "Salvar Alterações" : "Efetivar Cadastro"}
          </button>
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
  onFlagDeletion?: (clientId: string) => Promise<void>;
  editingClient: ClientOrganization | null;
  clientFormData: ClientFormData;
  setClientFormData: (data: ClientFormData) => void;
  qualityAnalysts: User[];
  requiresConfirmation?: boolean;
  isSaving?: boolean;
}

export const ClientModal: React.FC<ClientModalProps> = ({ 
  isOpen, onClose, onSave, onFlagDeletion, editingClient, clientFormData, setClientFormData, qualityAnalysts, requiresConfirmation = false, isSaving = false
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
      <form onSubmit={handleSubmit} className="pb-4">
        <FormField label={t('dashboard.organization')} id="client-name" required>
          <TextInput 
            id="client-name"
            value={clientFormData.name} 
            onChange={e => setClientFormData({...clientFormData, name: e.target.value})} 
            required 
            disabled={isSaving}
          />
        </FormField>

        <FormField label={t('dashboard.fiscalID')} id="client-cnpj" required>
          <TextInput 
            id="client-cnpj"
            value={clientFormData.cnpj} 
            onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} 
            required 
            disabled={isSaving}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-0">
          <FormField label={t('dashboard.contractDate')} id="client-date" required>
            <TextInput 
              id="client-date"
              type="date" 
              value={clientFormData.contractDate} 
              onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})} 
              required 
              disabled={isSaving}
            />
          </FormField>
          <FormField label={t('common.status')} id="client-status">
            <SelectInput 
              id="client-status"
              value={clientFormData.status} 
              onChange={e => setClientFormData({...clientFormData, status: e.target.value as AccountStatus})}
              disabled={isSaving}
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
            disabled={isSaving}
          >
            <option value="">{t('common.na')}</option>
            {qualityAnalysts.map(qa => <option key={qa.id} value={qa.id}>{qa.name}</option>)}
          </SelectInput>
        </FormField>

        {editingClient && onFlagDeletion && (
           <div className="mx-8 mt-6 p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3">
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={14} /> Zona de Governança
              </p>
              <p className="text-xs text-red-800 font-medium leading-relaxed">
                A exclusão definitiva de uma empresa parceira exige auditoria Master. Sinalizar esta empresa interromperá todos os acessos dos seus usuários técnicos.
              </p>
              <button 
                type="button"
                disabled={isSaving}
                onClick={() => onFlagDeletion(editingClient.id)}
                className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Sinalizar para Exclusão
              </button>
           </div>
        )}

        {requiresConfirmation && (
          <div className="mx-8 mt-6 p-5 bg-blue-50 text-blue-700 text-sm rounded-2xl border border-blue-100 space-y-3">
            <h4 className="font-bold flex items-center gap-2"><Info size={16} /> Confirmar Ação Técnica</h4>
            <TextInput 
              type="email" 
              placeholder="Confirme seu E-mail" 
              value={confirmEmail} 
              onChange={e => setConfirmEmail(e.target.value)} 
              required 
              disabled={isSaving}
            />
            <TextInput 
              type="password" 
              placeholder="Confirme sua Senha" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              disabled={isSaving}
            />
          </div>
        )}

        <div className="mt-8 px-8 py-6 sticky bottom-0 bg-white border-t border-slate-100 flex justify-end gap-3 z-10 shadow-[0_-10px_20px_rgba(255,255,255,0.8)]">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSaving}
            className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-10 py-3 bg-[#081437] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingClient ? "Atualizar Empresa" : "Criar Empresa"}
          </button>
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
      <form onSubmit={handleSubmit} className="pb-4">
        <FormField label={t('maintenanceSchedule.eventTitle')} id="m-title" required>
          <TextInput 
            id="m-title"
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder={t('maintenanceSchedule.eventTitlePlaceholder')}
            required 
            disabled={isSaving}
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-0">
          <FormField label={t('maintenanceSchedule.date')} id="m-date" required>
            <TextInput 
              id="m-date"
              type="date" 
              value={formData.scheduledDate} 
              onChange={e => setFormData({...formData, scheduledDate: e.target.value})} 
              required 
              disabled={isSaving}
          />
          </FormField>
          <FormField label={t('maintenanceSchedule.time')} id="m-time" required>
            <TextInput 
              id="m-time"
              type="time" 
              value={formData.scheduledTime} 
              onChange={e => setFormData({...formData, scheduledTime: e.target.value})} 
              required 
              disabled={isSaving}
            />
          </FormField>
        </div>

        <FormField label={t('maintenanceSchedule.duration')} id="m-duration" required>
          <TextInput 
            id="m-duration"
            type="number" 
            value={formData.durationMinutes.toString()} 
            onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})} 
            required 
            disabled={isSaving}
          />
        </FormField>

        <FormField label={t('maintenanceSchedule.customMessage')} id="m-desc">
          <textarea 
            id="m-desc"
            disabled={isSaving}
            className="w-full px-4 py-2.5 rounded-lg font-medium text-slate-900 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all min-h-[100px] outline-none disabled:opacity-50"
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
        </FormField>

        <div className="mt-8 px-8 py-6 sticky bottom-0 bg-white border-t border-slate-100 flex justify-end gap-3 z-10 shadow-[0_-10px_20px_rgba(255,255,255,0.8)]">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSaving}
            className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSaving} 
            className="px-10 py-3 bg-[#081437] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {t('maintenanceSchedule.scheduleButton')}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};
