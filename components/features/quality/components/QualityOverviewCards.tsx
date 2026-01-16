
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, FileWarning, ShieldCheck, Activity, ArrowUpRight, LucideIcon } from 'lucide-react';

interface QualityOverviewCardsProps {
  totalClients: number;
  totalPendingDocs: number;
  onChangeView: (view: string) => void;
}

interface KpiConfig {
    id: string;
    label: string;
    value: string | number;
    subtext: string;
    icon: LucideIcon;
    color: string;
    view: string;
    shadow: string;
    accent: string;
}

export const QualityOverviewCards: React.FC<QualityOverviewCardsProps> = ({ totalClients, totalPendingDocs, onChangeView }) => {
  const { t } = useTranslation();

  const cardConfig: KpiConfig[] = useMemo(() => [
    {
      id: 'clients',
      label: t('quality.activePortfolio'),
      value: totalClients,
      subtext: "Empresas Monitoradas",
      icon: Building2,
      color: "bg-[#081437]",
      shadow: "shadow-slate-900/5",
      view: 'clients',
      accent: "text-blue-400"
    },
    {
      id: 'pending',
      label: t('quality.pendingDocs'),
      value: totalPendingDocs,
      subtext: "Urgência de Inspeção",
      icon: FileWarning,
      color: "bg-[#b23c0e]",
      shadow: "shadow-[#b23c0e]/10",
      view: 'clients',
      accent: "text-white"
    },
    {
      id: 'compliance',
      label: "Qualidade de Dados",
      value: "94.2%",
      subtext: t('quality.complianceISO'),
      icon: ShieldCheck,
      color: "bg-emerald-600",
      shadow: "shadow-emerald-500/10",
      view: 'overview',
      accent: "text-white"
    },
    {
      id: 'alerts',
      label: "Eventos Auditados",
      value: 12,
      subtext: "Logs nas últimas 24h",
      icon: Activity,
      color: "bg-slate-600",
      shadow: "shadow-slate-500/5",
      view: 'audit-log',
      accent: "text-white"
    }
  ], [totalClients, totalPendingDocs, t]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardConfig.map((card) => (
        <KpiCard 
            key={card.id} 
            card={card} 
            onClick={() => onChangeView(card.view)} 
        />
      ))}
    </div>
  );
};

const KpiCard: React.FC<{ card: KpiConfig; onClick: () => void }> = ({ card, onClick }) => {
    const Icon = card.icon;
    return (
        <button
            onClick={onClick}
            className="group bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-slate-100 transition-colors" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-2.5 rounded-xl ${card.color} text-white shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={card.accent} />
              </div>
              <ArrowUpRight size={16} className="text-slate-200 group-hover:text-[#b23c0e] transition-colors" />
            </div>

            <div className="relative z-10">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{card.label}</p>
              <h3 className="text-3xl font-bold text-[#081437] tracking-tight">{card.value}</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mt-1 opacity-80">{card.subtext}</p>
            </div>
        </button>
    );
};
