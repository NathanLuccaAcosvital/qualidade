import React, { useState } from 'react';
import { Database, ShieldCheck, Download, History, AlertTriangle, Loader2, Save, FileJson } from 'lucide-react';
import { useAuth } from '../../../../context/authContext.tsx';
import { adminService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';

export const AdminBackup: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartBackup = async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const { blob, fileName } = await adminService.generateSystemBackup(user);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showToast("Master Recovery Ledger gerado e transferido.", 'success');
    } catch (err: any) {
      showToast("Falha técnica ao compilar manifesto de segurança.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Hero de Backup */}
      <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-blue-500/20" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-6 max-w-xl text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
               <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                  <Database size={32} />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tight">Cofre de Segurança</h3>
            </div>
            <p className="text-slate-400 text-base leading-relaxed font-medium">
              Gere um <b>Manifesto de Recuperação Master</b>. Este arquivo contém a estrutura lógica completa da Aços Vital, permitindo a reconstrução imediata da governança em caso de falha catastrófica regional.
            </p>
            <div className="flex items-center gap-4 py-2">
               <Badge label="Criptografia AES-256" />
               <Badge label="Assinado Digitalmente" />
            </div>
          </div>
          <button 
            onClick={handleStartBackup}
            disabled={isGenerating}
            className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[3px] transition-all shadow-xl active:scale-95 whitespace-nowrap flex items-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Compilar Backup Agora
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatusCard 
            icon={ShieldCheck} 
            label="Integridade do Cluster" 
            value="Nominal" 
            sub="Verificado há 14m" 
            color="text-emerald-500"
         />
         <StatusCard 
            icon={FileJson} 
            label="Tamanho do Manifesto" 
            value="~4.2 MB" 
            sub="Base de metadados" 
            color="text-blue-500"
         />
         <StatusCard 
            icon={History} 
            label="Frequência Exigida" 
            value="Semanal" 
            sub="ISO 27001 Compliance" 
            color="text-orange-500"
         />
      </div>

      {/* Histórico de Ações de Backup */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[5px] text-slate-400 flex items-center gap-2 ml-4">
          <History size={14} /> Histórico de Sincronização de Desastre
        </h4>
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                    <Download size={24} />
                </div>
                <p className="text-slate-500 text-sm font-medium italic">
                    Consulte os logs de auditoria para visualizar a rastreabilidade completa de todos os backups gerados historicamente.
                </p>
            </div>
        </div>
      </section>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4">
         <AlertTriangle className="text-amber-600 shrink-0" size={24} />
         <div className="space-y-1">
            <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Aviso de Segurança</p>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Backups contêm informações sensíveis de clientes e certificados. Mantenha os arquivos gerados em dispositivos externos seguros e criptografados. Nunca compartilhe manifestos via e-mail sem proteção.
            </p>
         </div>
      </div>
    </div>
  );
};

const Badge = ({ label }: { label: string }) => (
  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-300">
    {label}
  </span>
);

const StatusCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color} shadow-inner`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-black text-slate-800 tracking-tight">{value}</p>
      <p className="text-[9px] text-slate-400 font-bold uppercase">{sub}</p>
    </div>
  </div>
);