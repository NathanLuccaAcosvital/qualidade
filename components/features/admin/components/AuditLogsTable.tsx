
import React from 'react';
import { Eye, Filter, Zap, ShieldCheck, FileText, Lock, Award, Key, Truck, Gavel, UserCheck, Download, History, Edit3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuditLog } from '../../../../types/index.ts';

interface AuditLogsTableProps {
    logs: AuditLog[];
    severityFilter: string;
    onSeverityChange: (sev: string) => void;
    onInvestigate: (log: AuditLog) => void;
}

/**
 * Mapeamento de Ações Industriais para Linguagem Humana (Business Process)
 */
const getActionDisplay = (action: string) => {
  const mapping: Record<string, { label: string; icon: any; color: string }> = {
    // 7 Passos do Fluxo Vital - Humanizado
    'SIGN_STEP1_RELEASE': { label: 'Início do Processo de Qualidade', icon: Key, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    'SIGN_STEP2_DOCUMENTAL': { label: 'Validação de Documentos do Lote', icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'SIGN_STEP3_PHYSICAL': { label: 'Vistoria Física da Carga', icon: Truck, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'SIGN_STEP4_ARBITRAGE': { label: 'Mediação Técnica Finalizada', icon: Gavel, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    'SIGN_STEP5_PARTNER_VERDICT': { label: 'Aceite Final pelo Cliente', icon: UserCheck, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'SIGN_STEP6_CONSOLIDATION_CLIENT': { label: 'Assinatura Digital (Cliente)', icon: Lock, color: 'bg-slate-100 text-slate-800 border-slate-300' },
    'SIGN_STEP6_CONSOLIDATION_QUALITY': { label: 'Assinatura Digital (Qualidade)', icon: Lock, color: 'bg-slate-100 text-slate-800 border-slate-300' },
    'SIGN_STEP7_CERTIFICATION': { label: 'Certificado de Qualidade Emitido', icon: Award, color: 'bg-amber-50 text-amber-700 border-amber-300' },

    // Ações de Arquivo - Humanizado
    'FILE_VIEW': { label: 'Documento Visualizado', icon: Eye, color: 'bg-slate-50 text-slate-600 border-slate-200' },
    'CLIENT_FILE_VIEW': { label: 'Cliente Visualizou o Laudo', icon: Eye, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    'FILE_DOWNLOAD': { label: 'Download de Arquivo Realizado', icon: Download, color: 'bg-slate-50 text-slate-600 border-slate-200' },
    'FILE_RENAME': { label: 'Nome do Arquivo Alterado', icon: Edit3, color: 'bg-slate-50 text-slate-600 border-slate-200' },

    // Gestão de Cadastros - Humanizado
    'USER_REGISTERED': { label: 'Novo Usuário Ativado no Portal', icon: Zap, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    'CLIENT_CREATE': { label: 'Nova Empresa Adicionada à Carteira', icon: Zap, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    'CLIENT_UPDATE': { label: 'Cadastro de Empresa Atualizado', icon: Zap, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    'SYS_STATUS_CHANGE': { label: 'Manutenção do Portal Realizada', icon: ShieldCheck, color: 'bg-red-50 text-red-700 border-red-200' },
    'SYSTEM_BACKUP_GENERATED': { label: 'Cópia de Segurança Criada', icon: Lock, color: 'bg-slate-900 text-white border-slate-800' },
  };

  return mapping[action] || { label: action.replace(/_/g, ' '), icon: ShieldCheck, color: 'bg-slate-100 text-slate-600 border-slate-200' };
};

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ 
    logs, 
    onInvestigate 
}) => {
    const { t } = useTranslation();

    return (
        <div className="w-full flex flex-col animate-in fade-in duration-300">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-3 min-w-[1000px]">
                    <thead className="text-slate-400">
                        <tr>
                            <th className="px-8 py-2 text-[9px] font-black uppercase tracking-[3px]">{t('admin.stats.headers.timestamp')}</th>
                            <th className="px-8 py-2 text-[9px] font-black uppercase tracking-[3px]">{t('admin.stats.headers.user')}</th>
                            <th className="px-8 py-2 text-[9px] font-black uppercase tracking-[3px]">Atividade Realizada</th>
                            <th className="px-8 py-2 text-[9px] font-black uppercase tracking-[3px]">{t('admin.stats.headers.target')}</th>
                            <th className="px-8 py-2 text-[9px] font-black uppercase tracking-[3px]">{t('admin.stats.headers.ip')}</th>
                            <th className="px-8 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <AuditLogRow 
                                key={log.id} 
                                log={log} 
                                onInvestigate={() => onInvestigate(log)} 
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AuditLogRow: React.FC<{ log: AuditLog, onInvestigate: () => void }> = ({ log, onInvestigate }) => {
  const display = getActionDisplay(log.action);
  const Icon = display.icon;

  return (
    <tr 
        className="group bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm hover:shadow-xl border border-slate-100" 
        onClick={onInvestigate}
    >
        <td className="px-8 py-5 text-[11px] text-slate-500 font-mono first:rounded-l-[2rem]">
            <div className="flex flex-col">
                <span className="font-black text-slate-700">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</span>
                <span className="opacity-60">{new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </td>
        <td className="px-8 py-5">
            <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{log.userName}</div>
            <div className="text-[9px] text-blue-600 font-black uppercase tracking-widest opacity-60">{log.userRole}</div>
        </td>
        <td className="px-8 py-5">
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 transition-all ${display.color}`}>
                <Icon size={14} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-tight">{display.label}</span>
            </div>
        </td>
        <td className="px-8 py-5 max-w-[200px]">
            <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter" title={log.target}>
                {log.target}
            </p>
        </td>
        <td className="px-8 py-5">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                {log.ip || '---.---.---.---'}
            </span>
        </td>
        <td className="px-8 py-5 text-right last:rounded-r-[2rem]">
            <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-[#132659] group-hover:text-white rounded-2xl transition-all shadow-sm group-active:scale-95 border border-transparent group-hover:border-[#132659]">
                <Eye size={16} />
            </div>
        </td>
    </tr>
  );
};
