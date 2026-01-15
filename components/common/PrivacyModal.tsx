
import React from 'react';
import { X, Shield, Lock, FileText, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"> {/* Ajustado z-index para 150 */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
        <ModalHeader title={t('privacy.title')} subtitle={t('privacy.subtitle')} onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            <PrivacySection 
              title={t('privacy.section1')} 
              icon={<FileText size={20} className="text-[var(--color-detail-blue)]" />}
            >
                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    O <strong>{t('menu.portalName')} {t('menu.brand')}</strong> é uma plataforma B2B destinada ao gerenciamento de documentos técnicos e certificados de qualidade. Esta política visa esclarecer a conformidade com a ISO 9001 e a legislação LGPD vigente.
                </p>
            </PrivacySection>

            <PrivacySection 
              title={t('privacy.section2')} 
              icon={<Eye size={20} className="text-[var(--color-detail-blue)]" />}
            >
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        <li><strong>Identificação:</strong> Nome e e-mail corporativo.</li>
                        <li><strong>Corporativo:</strong> CNPJ e histórico contratual.</li>
                        <li><strong>Auditoria:</strong> Logs de IP e ações (visualização/download).</li>
                    </ul>
                </div>
            </PrivacySection>

            <PrivacySection 
              title={t('privacy.section3')} 
              icon={<Lock size={20} className="text-[var(--color-detail-blue)]" />}
            >
                <p className="text-sm text-slate-600 leading-relaxed">
                    Utilizamos criptografia TLS 1.2+ e segregação estrita por organização (Multi-tenant). Seus documentos nunca são acessíveis por outras empresas do portfólio.
                </p>
            </PrivacySection>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-[var(--color-primary-dark-blue)] text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
            >
                {t('privacy.close')}
            </button>
        </div>
      </div>
    </div>
  );
};

/* --- Sub-componentes de UI (Clean Code) --- */

const ModalHeader = ({ title, subtitle, onClose }: any) => (
  <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
    <div className="flex items-center gap-3">
      <div className="bg-blue-100 p-2 rounded-lg"><Shield className="text-[var(--color-detail-blue)]" size={24} /></div>
      <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{subtitle}</p>
      </div>
    </div>
    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all"><X size={24} /></button>
  </div>
);

const PrivacySection = ({ title, icon, children }: any) => (
  <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
    <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-wider text-slate-700 mb-4">
        {icon} {title}
    </h3>
    {children}
  </section>
);
