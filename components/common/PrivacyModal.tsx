
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="text-blue-600" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">{t('privacy.title')}</h2>
                <p className="text-xs text-slate-500">{t('privacy.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            
            <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-3">
                    <FileText size={20} className="text-blue-500" /> {t('privacy.section1')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    O <strong>{t('menu.portalName')} {t('menu.brand')}</strong> é uma plataforma B2B destinada ao gerenciamento de documentos técnicos, certificados de qualidade e rastreabilidade de materiais. Esta política visa esclarecer como coletamos, armazenamos e protegemos os dados de nossos clientes corporativos e seus representantes, garantindo transparência e conformidade com as normas industriais (ISO 9001) e a legislação vigente.
                </p>
            </section>

            <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-3">
                    <Eye size={20} className="text-blue-500" /> {t('privacy.section2')}
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">Para garantir a segurança e a auditabilidade do sistema, coletamos as seguintes informações:</p>
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        <li><strong>Dados de Identificação:</strong> Nome completo, e-mail corporativo e cargo.</li>
                        <li><strong>Dados Corporativos:</strong> CNPJ da empresa vinculada e histórico de contratos.</li>
                        <li><strong>Logs de Acesso:</strong> Endereço IP, data/hora de login e ações realizadas (download, upload, visualização) para fins de auditoria de segurança.</li>
                    </ul>
                </div>
            </section>

            <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-3">
                    <Lock size={20} className="text-blue-500" /> {t('privacy.section3')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    Adotamos medidas técnicas rigorosas para proteger seus dados, incluindo criptografia em trânsito (TLS 1.2+) e em repouso. O acesso aos documentos é estritamente segregado: usuários de uma organização (CNPJ) não possuem acesso a documentos de outras organizações, garantindo o sigilo industrial.
                </p>
            </section>

            <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-3">
                    <FileText size={20} className="text-blue-500" /> {t('privacy.section4')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed text-justify mb-2">
                    Utilizamos cookies essenciais para o funcionamento do portal:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="p-3 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white">
                        <span className="font-bold block text-slate-800">Sessão e Autenticação</span>
                        Manter você logado de forma segura durante sua navegação.
                    </li>
                    <li className="p-3 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white">
                        <span className="font-bold block text-slate-800">Preferências</span>
                        Lembrar do estado do menu lateral e filtros de visualização.
                    </li>
                </ul>
            </section>

            <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-3">
                    <Shield size={20} className="text-blue-500" /> {t('privacy.section5')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    Conforme a LGPD, você tem direito a solicitar a confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados e a anonimização ou bloqueio. Para exercer esses direitos, entre em contato com nosso Encarregado de Dados (DPO) através do canal oficial: <strong>dpo@acosvital.com.br</strong>.
                </p>
            </section>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
                {t('privacy.close')}
            </button>
        </div>
      </div>
    </div>
  );
};
