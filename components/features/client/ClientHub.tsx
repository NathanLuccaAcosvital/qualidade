
import React, { useMemo, useState } from 'react';
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
    Filter
} from 'lucide-react';
import { ClientOrganization } from '../../../types.ts';

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
}

type ViewMode = 'grid' | 'list';
type SortKey = 'NAME' | 'PENDING' | 'NEWEST';

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
    onLoadMore
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [sortKey, setSortKey] = useState<SortKey>('NAME');

    // Remove a simulação de dados analíticos. Agora, 'clients' deve vir do backend com esses dados.
    const sortedClients = useMemo(() => {
        return [...clients].sort((a, b) => { // Usa 'clients' diretamente
            if (sortKey === 'NAME') return a.name.localeCompare(b.name);
            // Assume 0 se pendingDocs ou complianceScore não estiverem definidos
            if (sortKey === 'PENDING') return (b.pendingDocs || 0) - (a.pendingDocs || 0); 
            if (sortKey === 'NEWEST') return new Date(b.contractDate).getTime() - new Date(a.contractDate).getTime();
            return 0;
        });
    }, [clients, sortKey]);

    const clientGroups = useMemo(() => {
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
        const actualScore = score || 0;

        if (actualPending > 0) {
            return (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-600 rounded-lg border border-orange-100 animate-pulse">
                    <AlertCircle size={12} />
                    <span className="text-[10px] font-black uppercase">{actualPending} Pendências</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <CheckCircle2 size={12} />
                <span className="text-[10px] font-black uppercase">100% Compliance</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
            {/* Barra de Auditoria e Controles */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Auditar cliente por nome ou CNPJ..." 
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                        value={clientSearch} 
                        onChange={e => setClientSearch(e.target.value)} 
                    />
                </div>
                
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    {/* Toggle de View */}
                    <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden xl:block" />

                    {/* Ordenação por Criticidade */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl flex-1 xl:flex-none">
                        <select 
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                            className="bg-transparent border-none text-xs font-bold text-slate-600 px-3 py-1.5 focus:ring-0 cursor-pointer"
                        >
                            <option value="NAME">Nome (A-Z)</option>
                            <option value="PENDING">Críticos (Pendências)</option>
                            <option value="NEWEST">Recentes (Contrato)</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        {(['ALL', 'ACTIVE'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setClientStatus(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    clientStatus === status 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {status === 'ALL' ? 'Todos' : 'Ativos'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Lista com Infinite Scroll */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
                {isLoading && sortedClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 size={40} className="animate-spin text-blue-500" />
                        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Acessando registros de auditoria...</p>
                    </div>
                ) : sortedClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">Nenhum registro encontrado para auditoria.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="space-y-10">
                        {clientGroups.map(([letter, groupClients]) => (
                            <div key={letter} className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-[4px]">{letter}</span>
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {groupClients.map(c => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => onSelectClient(c)} 
                                            className={`bg-white p-5 rounded-2xl border ${c.pendingDocs && c.pendingDocs > 0 ? 'border-orange-200 bg-orange-50/10' : 'border-slate-200'} hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group relative overflow-hidden`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl transition-all shadow-sm ${
                                                    c.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                    <Users size={24}/>
                                                </div>
                                                {renderHealthBadge(c.complianceScore, c.pendingDocs)}
                                            </div>

                                            <h3 className="font-bold text-slate-800 text-sm truncate pr-2 group-hover:text-blue-700 transition-colors" title={c.name}>{c.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-wider uppercase">{c.cnpj}</p>
                                            
                                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Saúde Compliance</span>
                                                    <span className="text-xs font-bold text-slate-700">{c.complianceScore}%</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">Desde {new Date(c.contractDate).getFullYear()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Organização / Razão Social</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">ID Fiscal</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Saúde Compliance</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Pendências</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Última Análise</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedClients.map(c => (
                                    <tr 
                                        key={c.id} 
                                        onClick={() => onSelectClient(c)}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {c.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-800">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{c.cnpj}</td>
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {c.pendingDocs && c.pendingDocs > 0 ? (
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-[10px] font-black uppercase">
                                                        {c.pendingDocs} Críticas
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[10px] font-black uppercase">
                                                        Em Dia
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{'N/A'}</td> {/* `lastAnalysis` is still mocked, leaving as N/A */}
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all inline" />
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
                        >
                            {isLoadingMore ? 'Carregando Chunks...' : 'Auditar mais clientes'}
                        </button>
                    ) : (
                        sortedClients.length > 0 && (
                            <p className="text-xs font-black text-slate-300 uppercase tracking-[4px]">Auditado • {sortedClients.length} Registros</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};