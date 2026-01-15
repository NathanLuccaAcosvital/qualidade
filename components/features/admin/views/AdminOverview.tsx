
import React from 'react';
import { Loader2 } from 'lucide-react';
import { AdminStatsData } from '../../../../lib/services/interfaces.ts';
import { AdminStats } from '../components/AdminStats.tsx';

/**
 * AdminOverview View (Real Data Integration)
 * Exibe apenas indicadores confirmados pelo banco de dados.
 */
export const AdminOverview: React.FC<{ stats: AdminStatsData | null }> = ({ stats }) => {
  if (!stats) return <LoadingOverview />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-8">
      {/* 
          Substituímos os cards de infraestrutura (CPU/RAM) pelo AdminStats, 
          que utiliza os campos totalUsers, activeUsers, activeClients e logsLast24h
          que são retornados pelo SupabaseAdminService.
      */}
      <AdminStats 
        usersCount={stats.totalUsers}
        activeUsersCount={stats.activeUsers}
        clientsCount={stats.activeClients}
        logsCount={stats.logsLast24h}
      />

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="space-y-1">
              <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Status da Governança</h4>
              <p className="text-xs text-blue-700 font-medium italic">Todos os indicadores acima são sincronizados em tempo real com a base de dados de produção.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sistemas OK</span>
          </div>
      </div>
    </div>
  );
};

const LoadingOverview = () => (
  <div className="h-64 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
    <Loader2 size={32} className="animate-spin text-[var(--color-detail-blue)]" />
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Sincronizando Métricas Reais...</p>
  </div>
);
