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

export const ClientHub: React.FC<ClientHubProps> = ({ 
  clients, isLoading, onSelectClient, viewMode, isLoadingMore, hasMore, onLoadMore 
}) => {
  if (isLoading) return <LoadingPortfolio />;

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-500">
      {viewMode === 'list' ? (
        <div className="flex-1 overflow-auto bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <table className="w-full text-left table-auto">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Organização</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Responsável</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Docs.</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Compliance</th>
                <th className="px-4 py-4"></th>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {clients.map(client => (
              <ClientCard key={client.id} client={client} onSelect={() => onSelectClient(client)} />
            ))}
            {hasMore && <div className="col-span-full py-4 flex justify-center"><LoadMoreButton loading={isLoadingMore} onClick={onLoadMore} /></div>}
          </div>
        </div>
      )}
    </div>
  );
};

const ClientRow: React.FC<{ client: ClientOrganization; onSelect: () => void }> = ({ client, onSelect }) => (
  <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={onSelect}>
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[var(--color-detail-blue)] flex items-center justify-center font-bold border border-blue-100 shrink-0 text-xs shadow-sm">
            {client.name?.[0] || '?'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">{client.name}</p>
          <p className="text-[9px] text-slate-400 font-mono">{client.cnpj}</p>
        </div>
      </div>
    </td>
    <td className="px-4 py-3.5 hidden lg:table-cell">
      <div className="flex items-center gap-2 text-slate-600 text-[11px] font-medium truncate max-w-[150px]">
        <User size={12} className="text-slate-300" />
        <span className="truncate">{client.qualityAnalystName || "N/A"}</span>
      </div>
    </td>
    <td className="px-4 py-3.5 text-center">
      <StatusBadge count={client.pendingDocs || 0} />
    </td>
    <td className="px-4 py-3.5 text-center">
      <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
      </div>
    </td>
    <td className="px-4 py-3.5 text-right">
      <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 transition-colors ml-auto" />
    </td>
  </tr>
);

const ClientCard: React.FC<{ client: ClientOrganization; onSelect: () => void }> = ({ client, onSelect }) => (
  <div onClick={onSelect} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden h-fit">
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-2xl bg-[#081437] text-white flex items-center justify-center text-lg font-black mb-4 shadow-lg group-hover:scale-105 transition-transform">
        {client.name?.[0] || '?'}
      </div>
      <h4 className="text-sm font-black text-[#081437] leading-tight truncate">{client.name}</h4>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-4">{client.cnpj}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div>
          <p className="text-[8px] font-black uppercase text-slate-400">Docs. Pendentes</p>
          <p className={`text-xs font-black ${(client.pendingDocs || 0) > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
            {client.pendingDocs || 0}
          </p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ count: number }> = ({ count }) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border transition-all ${
        count > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }`}>
        {count > 0 && <AlertCircle size={10} />}
        {count}
    </span>
);

const LoadingPortfolio = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 animate-pulse">
    <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
    <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Sincronizando Portfólio...</p>
  </div>
);

const LoadMoreButton: React.FC<{ loading: boolean; onClick: () => void }> = ({ loading, onClick }) => (
  <div className="p-3 bg-slate-50/50 text-center border-t border-slate-50 shrink-0">
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} disabled={loading} className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all shadow-sm">
      {loading ? "Sincronizando..." : "Carregar Mais"}
    </button>
  </div>
);