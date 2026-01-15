
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.tsx';
import { fileService } from '../../lib/services/index.ts';
import { DashboardStatsData } from '../../lib/services/interfaces.ts';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  FileText, 
  Loader2, 
  ArrowUpRight, 
  ShieldCheck, 
  Library, 
  Star, 
  History,
  MoreVertical
} from 'lucide-react';
import { normalizeRole, UserRole, FileNode, FileType } from '../../types/index.ts';
import { FilePreviewModal } from '../../components/features/files/FilePreviewModal.tsx';

// ClientDashboard (para a view 'home')
const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  useEffect(() => {
    // Redirecionamento de roles já é tratado pelo ClientPage ou RoleMiddleware
    // Este useEffect agora foca apenas no carregamento de dados para o dashboard.
    if (user) {
      fileService.getDashboardStats(user).then(setStats);
      setIsLoadingRecent(true);
      fileService.getRecentFiles(user, 4).then(files => {
          setRecentFiles(files);
          setIsLoadingRecent(false);
      });
    }
  }, [user]);

  const handleFileSelect = (file: FileNode | null) => {
    if (file && file.type !== 'FOLDER') {
        setSelectedFile(file);
        setIsPreviewOpen(true);
    }
  };

  return (
    <>
      {/* Fix: Changed 'file' prop to 'initialFile' to match FilePreviewModalProps interface */}
      <FilePreviewModal 
        initialFile={selectedFile} 
        allFiles={recentFiles.filter(f => f.type !== FileType.FOLDER)} // Pass only files for navigation
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onDownloadFile={async (file: FileNode) => { // Implement download action
          try {
            const url = await fileService.getFileSignedUrl(user!, file.id);
            window.open(url, '_blank');
          } catch (error) {
            console.error("Download failed:", error);
          }
        }}
      />

      <div className="space-y-8 pb-12 animate-in fade-in duration-700">
        <DashboardHero name={user?.name.split(' ')[0] || ''} t={t} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted grid-cols for 3 cards */}
          <KpiCard 
            icon={Library} 
            label={t('dashboard.kpi.libraryLabel')} 
            value={stats?.subValue ?? '--'} 
            subtext={t('dashboard.kpi.activeDocsSubtext')} 
            color="orange-accent" // Altera para a nova variante de cor
            onClick={() => navigate('/client/dashboard?view=files')} 
            loading={!stats}
          />
          {/* Removed Favorites KpiCard 
          <KpiCard 
            icon={Star} 
            label={t('menu.favorites')} 
            value={0} // Mock favorites count or implement in service
            subtext="Arquivos Marcados" 
            color="orange-accent" // Altera para a nova variante de cor
            onClick={() => navigate('/client/dashboard?view=favorites')} 
            loading={!stats}
          />
          */}
          <KpiCard 
            icon={History} 
            label="Recentes" 
            value={recentFiles.length} 
            subtext="Visualizados Hoje" 
            color="slate" 
            onClick={() => navigate('/client/dashboard?view=files')} // Redireciona para a view de arquivos
            loading={!stats}
          />
           <KpiCard 
            icon={ShieldCheck} 
            label="Conformidade" 
            value={"ISO 9001"} 
            subtext="Certificação Ativa" 
            color="emerald" 
            onClick={() => navigate('/client/dashboard?view=files')} 
            loading={!stats}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Coluna Principal: Recentes / Sugestões */}
            <div className="xl:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-400">Certificados Recentes</h3>
                    <button onClick={() => navigate('/client/dashboard?view=files')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest">{t('dashboard.exploreAll')}</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isLoadingRecent ? (
                        Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse border border-slate-100" />)
                    ) : recentFiles.length > 0 ? (
                        recentFiles.map(file => (
                            <RecentFileCard key={file.id} file={file} onClick={() => handleFileSelect(file)} />
                        ))
                    ) : (
                        <div className="col-span-full h-32 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm italic">
                            Nenhum arquivo recente.
                        </div>
                    )}
                </div>
            </div>

            {/* Coluna Lateral: Status e Infos */}
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-400">Status de Conformidade</h3>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Operação Certificada</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ISO 9001:2015</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Rastreabilidade</span>
                            <span className="text-emerald-500">100% OK</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-full" />
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Todos os certificados exibidos neste portal foram validados pelo laboratório técnico da Aços Vital.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

/* --- Sub-componentes do Dashboard --- */

const DashboardHero = ({ name, t }: { name: string, t: any }) => (
  <div className="bg-[#081437] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
    <div className="relative z-10 space-y-4">
      {/* Container dos badges "Acesso Seguro" e "Portal do Cliente" */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4"> {/* Alterado para flex-wrap e adicionado gap */}
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-emerald-300 shadow-lg shadow-emerald-500/10 whitespace-nowrap">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Acesso Seguro</span>
          </span>
          {/* Badge "Portal do Cliente" com a nova cor e sem mt-2 */}
          <span className="px-3 py-1 bg-[#b23c0e] rounded-full text-[9px] font-black uppercase tracking-[3px] shadow-lg shadow-[#b23c0e]/20 whitespace-nowrap">Portal do Cliente</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight max-w-xl">
        Bem-vindo, <span className="text-[#4c81c6]">{name}.</span>
      </h1>
      <p className="text-slate-400 max-w-md text-sm font-medium leading-relaxed">
        Acesse seus certificados de qualidade validados e mantenha a rastreabilidade total de seus materiais.
      </p>
    </div>
  </div>
);

const KpiCard = ({ icon: Icon, label, value, subtext, color, onClick, loading }: any) => (
  <button 
    onClick={onClick} 
    className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm cursor-pointer hover:shadow-xl hover:border-blue-500 transition-all group text-left relative overflow-hidden"
    disabled={loading}
  >
    <div className="flex justify-between items-start">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
        color === 'blue' ? 'bg-blue-50 text-blue-600' : 
        color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
        color === 'orange-accent' ? 'bg-[#ff4C00]/10 text-[#ff4C00]' : 
        color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : // Added emerald variant
        'bg-slate-50 text-slate-600'
      }`}>
        <Icon size={28} />
      </div>
      <ArrowUpRight size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      {loading ? (
        <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg my-1" />
      ) : (
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h3>
      )}
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{subtext}</p>
    </div>
  </button>
);

// DO: Explicitly typing as React.FC to handle 'key' prop correctly in list iterations
const RecentFileCard: React.FC<{ file: FileNode; onClick: () => void }> = ({ file, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer flex flex-col justify-between h-36"
    >
        <div className="flex justify-between items-start">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                <FileText size={20} />
            </div>
            <button className="p-1.5 text-slate-300 hover:text-slate-600">
                <MoreVertical size={16} />
            </button>
        </div>
        <div>
            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{file.name}</p>
            <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-400 font-mono">{file.size}</p>
                <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase">
                    <ShieldCheck size={10} /> Disponível
                </div>
            </div>
        </div>
    </div>
);

export default ClientDashboard;
