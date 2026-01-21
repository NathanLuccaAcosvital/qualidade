
import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { ClientList } from '../../components/features/quality/views/ClientList.tsx';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanEye, Building2, UserPlus, Sliders } from 'lucide-react';
import { FileExplorerView } from '../../components/features/quality/views/FileExplorerView.tsx';
import { ClientModal } from '../../components/features/admin/components/AdminModals.tsx';
import { useQualityClientManagement } from '../../components/features/quality/hooks/useQualityClientManagement.ts';
import { ProcessingOverlay } from '../../components/features/quality/components/ViewStates.tsx';

const QualityPortfolio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orgId = searchParams.get('orgId');
  
  const {
    isProcessing,
    qualityAnalysts,
    clientModal
  } = useQualityClientManagement(0);

  return (
    <Layout title={orgId ? "Explorar Cliente" : "Gestão de Clientes"}>
      <div className="flex flex-col h-[calc(100vh-120px)] -m-4 md:-m-8 overflow-hidden animate-in fade-in duration-700">
        {isProcessing && <ProcessingOverlay message="Sincronizando protocolos..." />}
        
        <ClientModal
          isOpen={clientModal.isOpen}
          onClose={() => clientModal.setOpen(false)}
          onSave={clientModal.save}
          editingClient={clientModal.editing}
          clientFormData={clientModal.data}
          setClientFormData={clientModal.setData}
          qualityAnalysts={qualityAnalysts}
          requiresConfirmation={true}
        />

        {/* Sub-Header de Sistema Integrado */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                {orgId ? (
                   <button 
                     onClick={() => navigate('/quality/portfolio')}
                     className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:text-[#b23c0e] hover:bg-white transition-all shadow-sm group"
                   >
                     <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                   </button>
                ) : (
                    <div className="w-10 h-10 bg-blue-50 text-[#b23c0e] rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                        <Building2 size={20} />
                    </div>
                )}
                <div>
                    <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">
                        {orgId ? "Exploração de Ativos B2B" : "Diretório de Parceiros"}
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {orgId ? "Auditoria e monitoramento de laudos" : "Gestão cadastral e níveis de conformidade"}
                    </p>
                </div>
            </div>
            
            {!orgId && (
                <button 
                  onClick={() => clientModal.open()}
                  className="bg-[#b23c0e] hover:bg-[#8a2f0b] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-3 shadow-lg active:scale-95 transition-all"
                >
                  <UserPlus size={16} /> Novo Cadastro
                </button>
            )}
        </header>

        {/* Conteúdo com scroll independente */}
        <div className="flex-1 min-h-0 bg-slate-50 overflow-y-auto custom-scrollbar">
            {!orgId ? (
                <div className="p-6">
                    <ClientList onSelectClient={(c) => navigate(`/quality/portfolio?orgId=${c.id}`)} />
                </div>
            ) : (
                <div className="h-full">
                    <FileExplorerView orgId={orgId} />
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default QualityPortfolio;
