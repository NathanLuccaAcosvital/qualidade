
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, AlertCircle, CheckCircle2, User, Loader2, Edit3, Settings2 } from 'lucide-react';
import { ClientOrganization } from '../../../../types/index.ts';

interface ClientHubProps {
  clients: ClientOrganization[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectClient: (client: ClientOrganization) => void;
  onEditClient?: (client: ClientOrganization) => void;
  viewMode: 'grid' | 'list';
  sortKey: string;
}

export const ClientHub: React.FC<ClientHubProps> = ({ 
  clients, isLoading, onSelectClient, onEditClient, viewMode, isLoadingMore, hasMore, onLoadMore 
}) => {
  if (isLoading) return <LoadingPortfolio />;

  return (
    <div className="w-full animate-in fade-in duration-500">
      {viewMode === 'list' ? (
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Organização</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Responsável</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Docs. Pendentes</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Compliance</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clients.map(client => (
                  <ClientRow 
                    key={client.id} 
                    client={client} 
                    onSelect={() => onSelectClient(client)} 
                    onEdit={onEditClient ? () => onEditClient(client) : undefined}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && <LoadMoreButton loading={isLoadingMore} onClick={onLoadMore} />}
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {clients.map(client => (
              <ClientCard 
                key={client.id} 
                client={client} 
                onSelect={() => onSelectClient(client)} 
                onEdit={onEditClient ? () => onEditClient(client) : undefined}
              />
            ))}
            {hasMore && <div className="col-span-full py-4 flex justify-center"><LoadMoreButton loading={isLoadingMore} onClick={onLoadMore} /></div>}
          </div>
        </div>
      )}
    </div>
  );
};

const ClientRow: React.FC<{ client: ClientOrganization; onSelect: () => void; onEdit?: () => void }> = ({ client, onSelect, onEdit }) => (
  <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={onSelect}>
    <td className="px-6 py-4">
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
    <td className="px-6 py-4 hidden lg:table-cell">
      <div className="flex items-center gap-2 text-slate-600 text-[11px] font-medium truncate max-w-[150px]">
        <User size={12} className="text-slate-300" />
        <span className="truncate">{client.qualityAnalystName || "N/A"}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-center">
      <StatusBadge count={client.pendingDocs || 0} />
    </td>
    <td className="px-6 py-4 text-center">
      <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
      </div>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end gap-2">
        {onEdit && (
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Editar Empresa"
            >
                <Settings2 size={16} />
            </button>
        )}
        <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
      </div>
    </td>
  </tr>
);

const ClientCard: React.FC<{ client: ClientOrganization; onSelect: () => void; onEdit?: () => void }> = ({ client, onSelect, onEdit }) => (
  <div onClick={onSelect} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden h-fit">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#132659] text-white flex items-center justify-center text-lg font-black shadow-lg group-hover:scale-105 transition-transform">
            {client.name?.[0] || '?'}
        </div>
        {onEdit && (
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-blue-100 shadow-sm"
                title="Editar Empresa"
            >
                <Edit3 size={16} />
            </button>
        )}
      </div>
      <h4 className="text-sm font-black text-[#132659] leading-tight truncate">{client.name}</h4>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-4">{client.cnpj}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div>
          <p className="text-[8px] font-black uppercase text-slate-400">Docs. Pendentes</p>
          <p className={`text-xl font-black ${(client.pendingDocs || 0) > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
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
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${
        count > 0 ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
    }`}>
        {count > 0 ? <AlertCircle size={12} className="animate-pulse" /> : <CheckCircle2 size={12} />}
        {count}
    </span>
);

const LoadingPortfolio = () => (
  <div className="w-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 animate-pulse">
    <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
    <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Sincronizando Portfólio...</p>
  </div>
);

const LoadMoreButton: React.FC<{ loading: boolean; onClick: () => void }> = ({ loading, onClick }) => (
  <div className="p-4 bg-slate-50/50 text-center border-t border-slate-50 shrink-0">
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} disabled={loading} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all shadow-sm active:scale-95">
      {loading ? "Sincronizando..." : "Carregar Mais Empresas"}
    </button>
  </div>
);
