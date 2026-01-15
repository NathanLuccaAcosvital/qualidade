
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, AlertCircle, CheckCircle2, User, Loader2 } from 'lucide-react';
import { ClientOrganization } from '../../../../types/index.ts';

interface ClientHubProps {
  clients: ClientOrganization[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectClient: (client: ClientOrganization) => void;
  viewMode: 'grid' | 'list';
  sortKey: string;
}

/**
 * ClientHub (Orchestrator)
 * Gerencia a troca de contexto entre diferentes modos de exibição do portfólio.
 */
export const ClientHub: React.FC<ClientHubProps> = ({ 
  clients, isLoading, onSelectClient, viewMode, isLoadingMore, hasMore, onLoadMore 
}) => {
  if (isLoading) return <LoadingPortfolio />;

  return (
    <div className="animate-in fade-in duration-500">
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Organização</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Analista Responsável</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Pendências</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Saúde Compliance</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clients.map(client => (
                <ClientRow key={client.id} client={client} onSelect={() => onSelectClient(client)} />
              ))}
            </tbody>
          </table>
          {hasMore && <LoadMoreButton loading={isLoadingMore} onClick={onLoadMore} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} onSelect={() => onSelectClient(client)} />
          ))}
          {hasMore && <div className="col-span-full py-4 flex justify-center"><LoadMoreButton loading={isLoadingMore} onClick={onLoadMore} /></div>}
        </div>
      )}
    </div>
  );
};

/* --- Sub-componentes Puros (SRP) --- */

const ClientRow: React.FC<{ client: ClientOrganization; onSelect: () => void }> = ({ client, onSelect }) => (
  <tr className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={onSelect}>
    <td className="px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-detail-blue)] flex items-center justify-center font-bold border border-blue-100 shadow-sm">
            {client.name?.[0] || '?'}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 group-hover:text-[var(--color-detail-blue)] transition-colors">{client.name}</p>
          <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{client.cnpj}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
        <User size={14} className="text-slate-400" />
        {client.qualityAnalystName || "N/A"}
      </div>
    </td>
    <td className="px-6 py-4 text-center">
      <StatusBadge count={client.pendingDocs || 0} />
    </td>
    <td className="px-6 py-4 text-center">
      <div className="w-24 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
      </div>
    </td>
    <td className="px-6 py-4 text-right">
      <button className="p-2 text-slate-300 group-hover:text-[var(--color-detail-blue)] group-hover:translate-x-1 transition-all">
        <ChevronRight size={18} />
      </button>
    </td>
  </tr>
);

const ClientCard: React.FC<{ client: ClientOrganization; onSelect: () => void }> = ({ client, onSelect }) => (
  <div 
    onClick={onSelect} 
    className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-[var(--color-detail-blue)] transition-all cursor-pointer group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition-colors" />
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-dark-blue)] text-white flex items-center justify-center text-xl font-black mb-6 shadow-xl shadow-[var(--color-primary-dark-blue)]/20 group-hover:scale-110 transition-transform">
        {client.name?.[0] || '?'}
      </div>
      <h4 className="text-lg font-black text-[var(--color-primary-dark-blue)] leading-tight mb-1">{client.name}</h4>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">CNPJ: {client.cnpj}</p>
      
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <div>
          <p className="text-[9px] font-black uppercase text-slate-400">Pendências</p>
          <p className={`text-sm font-black ${(client.pendingDocs || 0) > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
            {client.pendingDocs || 0} Arquivos
          </p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-[var(--color-detail-blue)] group-hover:text-white transition-all shadow-sm">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ count: number }> = ({ count }) => {
    const isCritical = count > 0;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${
            isCritical ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
            {isCritical ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
            {count}
        </span>
    );
};

const LoadingPortfolio = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 animate-pulse">
    <Loader2 size={40} className="text-[var(--color-detail-blue)] animate-spin mb-4" />
    <p className="text-xs font-black uppercase tracking-[4px] text-slate-400">Varrendo Portfólio Industrial...</p>
  </div>
);

const LoadMoreButton: React.FC<{ loading: boolean; onClick: () => void }> = ({ loading, onClick }) => (
  <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }} 
        disabled={loading} 
        className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[var(--color-detail-blue)] hover:border-blue-200 transition-all disabled:opacity-50 shadow-sm"
    >
      {loading ? "Sincronizando..." : "Carregar Mais Clientes"}
    </button>
  </div>
);
