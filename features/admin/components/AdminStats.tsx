import React from 'react';
import { Users, Building2, LifeBuoy, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon, color }) => {
    const { t } = useTranslation();
    // Mapeamento de cores seguro
    const getColors = (c: string) => {
        switch(c) {
            case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600/10', circle: 'bg-blue-500' };
            case 'indigo': return { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-600/10', circle: 'bg-indigo-500' };
            case 'red': return { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600/10', circle: 'bg-red-500' };
            case 'orange': return { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600/10', circle: 'bg-orange-500' };
            default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: 'text-slate-600/10', circle: 'bg-slate-500' };
        }
    };
    const colors = getColors(color);

    return (
        <div 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
            role="region"
            aria-label={`${label}: ${value}. ${subtext || ''}`}
        >
            <div className={`absolute -right-6 -top-6 p-4 transform scale-150 transition-opacity opacity-0 group-hover:opacity-100 ${colors.icon}`} aria-hidden="true">
                <Icon size={120} />
            </div>
            <div className="relative z-10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`} aria-hidden="true">
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{value}</h3>
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
                    icon={Users} color="blue" 
                />
                <StatCard 
                    label={t('admin.stats.organizations')} 
                    value={clientsCount} 
                    subtext={t('admin.stats.activeClientsSummary', { count: clientsCount })}
                    icon={Building2} color="indigo" 
                />
                <StatCard 
                    label={t('admin.stats.activities')} 
                    value={logsCount > 99 ? '99+' : logsCount} 
                    subtext={t('admin.stats.logsLast24hSummary', { count: logsCount })}
                    icon={Activity} color="orange" 
                />
            </div>
        </div>
    );
};