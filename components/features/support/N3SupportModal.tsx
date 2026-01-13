import React, { useState } from 'react';
import { X, Briefcase, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// Fix: Import from services/index.ts to use the correctly typed and initialized service instances
import { adminService } from '../../../lib/services/index.ts';
import { User } from '../../../types.ts';
import { useToast } from '../../../context/notificationContext.tsx'; // Importado

interface N3SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const N3SupportModal: React.FC<N3SupportModalProps> = ({ isOpen, onClose, user }) => {
  const { t } = useTranslation();
  const { showToast } = useToast(); // Hook useToast
  const [n3Data, setN3Data] = useState({ 
      component: 'INFRA_UP', 
      description: '', 
      severity: 'HIGH',
      affectedContext: 'SYSTEM',
      module: 'DASHBOARD',
      steps: ''
  });

  const handleN3Submit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      try {
          const id = await adminService.requestInfrastructureSupport(user, n3Data);
          showToast(`${t('admin.n3Support.success')} ${id}`, 'success');
          onClose();
          setN3Data({ 
              component: 'INFRA_UP', 
              description: '', 
              severity: 'HIGH',
              affectedContext: 'SYSTEM',
              module: 'DASHBOARD',
              steps: '' 
          });
      } catch (error: any) {
          showToast(`Erro ao enviar solicitação N3: ${error.message}`, 'error');
      }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 w-screen h-screen z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
              {/* Dark Header for External Request distinction */}
              <div className="px-6 py-5 bg-slate-900 flex justify-between items-center shrink-0">
                  <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Briefcase size={20} className="text-orange-500"/> {t('admin.n3Support.title')}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{t('admin.n3Support.subtitle')}</p>
                  </div>
                  <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full p-2 transition-colors">
                      <X size={20} />
                  </button>
              </div>
              
              <form onSubmit={handleN3Submit} className="flex-1 overflow-y-auto p-6 space-y-5">
                  
                  {/* Row 1: Component & Impact */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('admin.n3Support.component')}</label>
                          <select 
                            required 
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium bg-white text-slate-700" 
                            value={n3Data.component} 
                            onChange={e => setN3Data({...n3Data, component: e.target.value})}
                          >
                              <option value="INFRA_UP">{t('admin.n3Support.components.INFRA_UP')}</option>
                              <option value="DB_MOD">{t('admin.n3Support.components.DB_MOD')}</option>
                              <option value="SECURITY_INC">{t('admin.n3Support.components.SECURITY_INC')}</option>
                              <option value="BACKUP_RESTORE">{t('admin.n3Support.components.BACKUP_RESTORE')}</option>
                              <option value="CUSTOM_DEV">{t('admin.n3Support.components.CUSTOM_DEV')}</option>
                          </select>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('admin.n3Support.impact')}</label>
                          <div className="flex gap-2">
                              {['MEDIUM', 'HIGH', 'CRITICAL'].map(level => (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => setN3Data({...n3Data, severity: level})}
                                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${n3Data.severity === level ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                  >
                                      {t(`admin.tickets.priority.${level}`)}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Row 2: Context & Module */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('admin.n3Support.context')}</label>
                          <select 
                            required 
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium bg-white text-slate-700" 
                            value={n3Data.affectedContext} 
                            onChange={e => setN3Data({...n3Data, affectedContext: e.target.value})}
                          >
                              <option value="SYSTEM">{t('admin.n3Support.contexts.SYSTEM')}</option>
                              <option value="CLIENT">{t('admin.n3Support.contexts.CLIENT')}</option>
                              <option value="INTERNAL">{t('admin.n3Support.contexts.INTERNAL')}</option>
                          </select>
                      </div>
                      
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('admin.n3Support.module')}</label>
                          <select 
                            required 
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium bg-white text-slate-700" 
                            value={n3Data.module} 
                            onChange={e => setN3Data({...n3Data, module: e.target.value})}
                          >
                              <option value="AUTH">{t('admin.n3Support.modules.AUTH')}</option>
                              <option value="DASHBOARD">{t('admin.n3Support.modules.DASHBOARD')}</option>
                              <option value="FILES">{t('admin.n3Support.modules.FILES')}</option>
                              <option value="API">{t('admin.n3Support.modules.API')}</option>
                          </select>
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">{t('common.description')}</label>
                      <textarea 
                        required 
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm h-24 resize-none bg-white text-slate-700" 
                        value={n3Data.description} 
                        onChange={e => setN3Data({...n3Data, description: e.target.value})} 
                        placeholder="Descreva a solicitação de forma objetiva..."
                      />
                  </div>

                  <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">{t('admin.n3Support.steps')}</label>
                      <textarea 
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm h-24 resize-none bg-slate-50 font-mono text-xs" 
                        value={n3Data.steps} 
                        onChange={e => setN3Data({...n3Data, steps: e.target.value})} 
                        placeholder="1. Acessar modulo X&#10;2. Clicar em Y&#10;3. Erro Z aparece..."
                      />
                  </div>
              </form>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={onClose} className="px-4 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition-colors">{t('common.cancel')}</button>
                  <button onClick={handleN3Submit} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/20">
                      <Send size={16} /> {t('admin.n3Support.submit')}
                  </button>
              </div>
          </div>
      </div>
  );
};