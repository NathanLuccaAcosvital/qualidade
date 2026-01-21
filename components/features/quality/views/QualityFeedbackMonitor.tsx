
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { FileNode, QualityStatus } from '../../../../types/index.ts';
import { MessageSquare, Clock, AlertCircle, FileText, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QualityLoadingState, QualityEmptyState } from '../components/ViewStates.tsx';

export const QualityFeedbackMonitor: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      setLoading(true);
      try {
        // FIX: Especificamos !files_owner_fkey com base na definição SQL fornecida anteriormente
        const { data, error } = await supabase
          .from('files')
          .select('*, organizations!files_owner_fkey(name)')
          .or(`metadata->>status.eq.${QualityStatus.REJECTED},metadata->>status.eq.${QualityStatus.APPROVED},metadata->>status.eq.${QualityStatus.TO_DELETE}`)
          .not('metadata->>lastClientInteractionAt', 'is', null)
          .order('metadata->>lastClientInteractionAt', { ascending: false })
          .limit(50);

        if (error) throw error;
        setInteractions(data || []);
      } catch (err) {
        console.error("Feedback Monitor Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, []);

  if (loading) return <QualityLoadingState message="Escaneando Diálogo B2B..." />;
  if (interactions.length === 0) return <QualityEmptyState message="Sem novas interações de clientes." icon={MessageSquare} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <div className="h-10 w-2 bg-orange-500 rounded-full" />
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Monitor de Contestação</h2>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {interactions.map(file => (
          <InteractionCard 
            key={file.id} 
            file={file} 
            onInspect={() => navigate(`/quality/inspection/${file.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

const InteractionCard: React.FC<{ file: any, onInspect: () => void }> = ({ file, onInspect }) => {
  const metadata = file.metadata;
  const isRejected = metadata?.status === QualityStatus.REJECTED;
  const isApproved = metadata?.status === QualityStatus.APPROVED;
  const isToDelete = metadata?.status === QualityStatus.TO_DELETE;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-lg transition-all group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${
        isRejected ? 'bg-red-500' : isApproved ? 'bg-emerald-500' : 'bg-slate-400'
      }`} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                isRejected ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
                {metadata?.status}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">{file.organizations?.name}</span>
          </div>
          <h4 className="text-sm font-black text-slate-800 leading-tight flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            {file.name}
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
             <Clock size={12} />
             Interação em {new Date(metadata?.lastClientInteractionAt).toLocaleString()}
          </div>
        </div>

        <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 relative">
           <MessageSquare size={32} className="absolute bottom-4 right-4 opacity-5 text-slate-400" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
             <User size={12} /> {metadata?.lastClientInteractionBy || 'Parceiro'} escreveu:
           </p>
           <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
             "{metadata?.clientObservations || 'O cliente não forneceu detalhes adicionais.'}"
           </p>
        </div>

        <div className="lg:w-48 flex items-center justify-end">
          <button 
            onClick={onInspect}
            className="w-full lg:w-auto px-6 py-3 bg-[#081437] text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-900 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
          >
            Auditar <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
