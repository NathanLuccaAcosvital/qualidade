import React, { useMemo } from 'react';
import { 
    Search, 
    Users, 
    Building2, 
    ChevronRight, 
    Loader2, 
    ArrowDownCircle, 
    LayoutGrid, 
    List, 
    AlertCircle, 
    CheckCircle2, 
    ArrowUpDown,
    Filter,
    UserCheck
} from 'lucide-react';
// Fix: Corrected import path for `ClientOrganization`
import { ClientOrganization } from '../../../types/index';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface ClientHubProps {
    clients: ClientOrganization[];
    clientSearch: string;
    setClientSearch: (val: string) => void;
    clientStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
    setClientStatus: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
    onSelectClient: (client: ClientOrganization) => void;
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    viewMode: 'grid' | 'list'; // NOVO: Prop para o modo de visualização
    sortKey: 'NAME' | 'PENDING' | 'NEWEST' | 'LAST_ANALYSIS'; // NOVO: Prop para a chave de ordenação
}

export const ClientHub: React.FC<ClientHubProps> = ({ 
    clients, 
    clientSearch, 
    setClientSearch, 
    clientStatus,
    setClientStatus,
    onSelectClient,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    viewMode, // Removido setViewMode
    sortKey // Removido setSortKey
}) => {
    const { t } = useTranslation(); // Use the hook

    // Remove a simulação de dados analíticos. Agora, 'clients' deve vir do backend com esses dados.
    // clients já está vindo pré-filtrado e pré-ordenado do hook useQualityClientManagement
    const sortedClients = useMemo(() => {
        if (!clients) return []; // Defensive check: return empty array if clients is null/undefined
        return [...clients].sort((a, b) => { // Usa 'clients' diretamente
            if (sortKey === 'NAME') return a.name.localeCompare(b.name);
            // Assume 0 se pendingDocs ou complianceScore não estiverem definidos
            if (sortKey === 'PENDING') return (b.pendingDocs || 0) - (a.pendingDocs || 0); 
            if (sortKey === 'NEWEST') return new Date(b.contractDate).getTime() - new Date(a.contractDate).getTime();
            if (sortKey === 'LAST_ANALYSIS') { // Novo critério de ordenação
                const dateA = a.lastAnalysisDate ? new Date(a.lastAnalysisDate).getTime() : 0;
                const dateB = b.lastAnalysisDate ? new Date(b.lastAnalysisDate).getTime() : 0;
                return dateB - dateA; // Mais recente primeiro
            }
            return 0;
        });
    }, [clients, sortKey]);

    const clientGroups = useMemo(() => {
        if (!sortedClients || sortedClients.length === 0) return []; // Defensive check
        const groups: Record<string, typeof clients[0][]> = {};
        sortedClients.forEach(c => {
            const letter = c.name.charAt(0).toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(c);
        });
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [sortedClients]);

    const renderHealthBadge = (score?: number, pending?: number) => {
        const actualPending = pending || 0;
        // const actualScore = score || 0; // Score não é usado diretamente aqui, mas é útil manter o contexto

        if (actualPending > 0) {
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-600 rounded-lg border border-orange-100 animate-pulse" aria-label={t('dashboard.pendingStatus', { count: actualPending })}>
                    <AlertCircle size={12} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase">{t('dashboard.pendingStatus', { count: actualPending })}</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100" aria-label={`100% ${t('dashboard.complianceHealth')}`}>
                <CheckCircle2 size={12} aria-hidden="true" />
                <span className="text-[10px] font-black uppercase">100% {t('dashboard.complianceHealth')}</span>
            </div>
        );
    };

    const formatAnalysisDate = (dateString?: string) => {
        if (!dateString) return t('common.na');
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300" role="main" aria-label={t('quality.b2bPortfolio')}>
            {/* Removida a barra de auditoria e controles, agora na ClientList.tsx */}
            
            {/* Lista com Infinite Scroll */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
                {isLoading && sortedClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64" role="status">
                        <Loader2 size={40} className="animate-spin text-blue-500" aria-hidden="true" />
                        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.accessingAuditRecords')}</p>
                    </div>
                ) : sortedClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200" role="status">
                        {/* Fix: Changed UsersIcon to Users from lucide-react */}
                        <Users size={48} className="mb-4 opacity-20" aria-hidden="true" />
                        <p className="font-medium">{t('dashboard.noRecordsFound')}</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="space-y-10">
                        {clientGroups.map(([letter, groupClients]) => (
                            <div key={letter} className="space-y-4" role="group" aria-labelledby={`group-label-${letter}`}>
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-px flex-1 bg-slate-200" aria-hidden="true"></div>
                                    <span id={`group-label-${letter}`} className="text-xs font-black text-slate-400 uppercase tracking-[4px]">{letter}</span>
                                    <div className="h-px flex-1 bg-slate-200" aria-hidden="true"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list">
                                    {groupClients.map(c => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => onSelectClient(c)} 
                                            className={`bg-white p-5 rounded-2xl border ${c.pendingDocs && c.pendingDocs > 0 ? 'border-orange-200 bg-orange-50/10' : 'border-slate-200'} hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group relative overflow-hidden`}
                                            role="listitem button"
                                            aria-label={`${c.name}. ${t('dashboard.fiscalID')}: ${c.cnpj}. ${t('dashboard.complianceHealth')}: ${c.complianceScore || 0}%. ${t('dashboard.pendingStatus', { count: c.pendingDocs || 0 })}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl transition-all shadow-sm ${
                                                    c.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                    {/* Fix: Changed UsersIcon to Users from lucide-react */}
                                                    <Users size={24} aria-hidden="true"/>
                                                </div>
                                                {renderHealthBadge(c.complianceScore, c.pendingDocs)}
                                            </div>

                                            <h3 className="font-bold text-slate-800 text-sm truncate pr-2 group-hover:text-blue-700 transition-colors" title={c.name}>{c.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-wider uppercase">{c.cnpj}</p>
                                            
                                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">{t('dashboard.complianceHealth')}</span>
                                                    <span className="text-xs font-bold text-slate-700">{c.complianceScore || 0}%</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">{t('dashboard.lastAnalysis')}</span>
                                                    <span className="text-xs font-medium text-slate-700">{formatAnalysisDate(c.lastAnalysisDate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse" role="table" aria-label={t('quality.b2bPortfolio')}>
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr role="row">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" scope="col">{t('dashboard.organization')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" scope="col">{t('dashboard.fiscalID')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" scope="col">Analista Qual.</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" scope="col">{t('dashboard.complianceHealth')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center" scope="col">{t('dashboard.kpi.pendingLabel')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" scope="col">{t('dashboard.lastAnalysis')}</th>
                                    <th className="px-6 py-4" scope="col"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100" role="rowgroup">
                                {sortedClients.map(c => (
                                    <tr 
                                        key={c.id} 
                                        onClick={() => onSelectClient(c)}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                        role="row"
                                        aria-label={`${c.name}. ${t('dashboard.fiscalID')}: ${c.cnpj}. ${t('dashboard.complianceHealth')}: ${c.complianceScore || 0}%. ${t('dashboard.pendingStatus', { count: c.pendingDocs || 0 })}`}
                                    >
                                        <td className="px-6 py-4" role="cell" data-label={t('dashboard.organization')}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {c.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-800">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500" role="cell" data-label={t('dashboard.fiscalID')}>{c.cnpj}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-700" role="cell" data-label="Analista Qual.">
                                            {c.qualityAnalystName || t('common.na')}
                                        </td>
                                        <td className="px-6 py-4" role="cell" data-label={t('dashboard.complianceHealth')}>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${c.complianceScore && c.complianceScore > 95 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                                                        style={{ width: `${c.complianceScore || 0}%` }} 
                                                    />
                                                </div>
                                                <span className="text-xs font-black text-slate-600">{c.complianceScore || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" role="cell" data-label={t('dashboard.kpi.pendingLabel')}>
                                            <div className="flex justify-center">
                                                {c.pendingDocs && c.pendingDocs > 0 ? (
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-[10px] font-black uppercase">
                                                        {c.pendingDocs} {t('dashboard.criticalPendencies')}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[10px] font-black uppercase">
                                                        {t('dashboard.upToDate')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase" role="cell" data-label={t('dashboard.lastAnalysis')}>{formatAnalysisDate(c.lastAnalysisDate)}</td>
                                        <td className="px-6 py-4 text-right" role="cell">
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all inline" aria-hidden="true" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Sentinel for Infinite Scroll */}
                <div className="pt-8 flex justify-center pb-4">
                    {hasMore ? (
                        <button 
                            onClick={onLoadMore}
                            disabled={isLoadingMore}
                            className="flex items-center gap-3 bg-white border border-slate-200 px-8 py-3 rounded-2xl text-slate-600 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group active:scale-95 disabled:opacity-50"
                            aria-label={t('dashboard.auditMoreClients')}
                        >
                            {isLoadingMore ? t('common.loading') : t('dashboard.auditMoreClients')}
                        </button>
                    ) : (
                        sortedClients.length > 0 && (
                            <p className="text-xs font-black text-slate-300 uppercase tracking-[4px]">{t('dashboard.auditedRecords', { count: sortedClients.length })}</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};