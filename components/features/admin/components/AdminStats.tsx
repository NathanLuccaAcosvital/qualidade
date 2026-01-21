import React from 'react';
import { Users, Building2, Activity, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  variant: 'blue' | 'indigo' | 'red' | 'orange' | 'slate';
  tooltip?: string;
}

const STAT_VARIANTS = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600/10', circle: 'bg-blue-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-600/10', circle: 'bg-indigo-500' },
  red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600/10', circle: 'bg-red-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600/10', circle: 'bg-orange-500' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', icon: 'text-slate-600/10', circle: 'bg-slate-500' },
};

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon, variant, tooltip }) => {
    const colors = STAT_VARIANTS[variant] || STAT_VARIANTS.slate;

    return (
        <div 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-visible group hover:shadow-md transition-all"
            role="region"
            aria-label={`${label}: ${value}. ${subtext || ''}`}
        >
            {/* Tooltip Premium */}
            {tooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[1.5px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100 z-50 whitespace-nowrap shadow-2xl border border-white/10">
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/90" />
              </div>
            )}

            <div className={`absolute -right-6 -top-6 p-4 transform scale-150 transition-opacity opacity-0 group-hover:opacity-100 ${colors.icon}`} aria-hidden="true">
                <Icon size={120} />
            </div>
            <div className="relative z-10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`} aria-hidden="true">
                    <Icon size={24} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{value}</h3>
                        <Info size={12} className="text-slate-300 opacity-100 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">{label}</p>
                </div>
            </div>
            {subtext && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.circle}`} aria-hidden="true"></span>
                        {subtext}
                    </p>
                </div>
            )}
        </div>
    );
};

interface AdminStatsProps {
    usersCount: number;
    activeUsersCount: number;
    clientsCount: number;
    logsCount: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ usersCount, activeUsersCount, clientsCount, logsCount }) => {
    const { t } = useTranslation();
    
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" role="region" aria-label={t('admin.tabs.overview')}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <StatCard 
                    label={t('admin.stats.totalUsers')} 
                    value={usersCount} 
                    subtext={`${activeUsersCount} ${t('common.statusActive')}`}
                    icon={Users} 
                    variant="blue" 
                    tooltip="Base de identidades autenticadas"
                />
                <StatCard 
                    label={t('admin.stats.organizations')} 
                    value={clientsCount} 
                    subtext={t('admin.stats.activeClientsSummary', { count: clientsCount })}
                    icon={Building2} 
                    variant="indigo" 
                    tooltip="Parceiros com contratos vigentes"
                />
                <StatCard 
                    label={t('admin.stats.activities')} 
                    value={logsCount > 99 ? '99+' : logsCount} 
                    subtext={t('admin.stats.logsLast24hSummary', { count: logsCount })}
                    icon={Activity} 
                    variant="orange" 
                    tooltip="Volume de logs operacionais (24h)"
                />
            </div>
        </div>
    );
};