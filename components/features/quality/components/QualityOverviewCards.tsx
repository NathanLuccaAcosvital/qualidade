
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
}

/**
 * Componente de Dashboard da Qualidade (Presentation)
 * Utiliza o Open/Closed Principle para facilitar a adição de novos KPIs.
 */
export const QualityOverviewCards: React.FC<QualityOverviewCardsProps> = ({ totalClients, totalPendingDocs, onChangeView }) => {
  const { t } = useTranslation();

  const cardConfig: KpiConfig[] = useMemo(() => [
    {
      id: 'clients',
      label: t('quality.activePortfolio'),
      value: totalClients,
      subtext: "Carteira Monitorada",
      icon: Building2,
      color: "bg-blue-600",
      shadow: "shadow-blue-500/20",
      view: 'clients'
    },
    {
      id: 'pending',
      label: t('quality.pendingDocs'),
      value: totalPendingDocs,
      subtext: "Aguardando Análise",
      icon: FileWarning,
      color: "bg-orange-500",
      shadow: "shadow-orange-500/20",
      view: 'clients'
    },
    {
      id: 'compliance',
      label: "Health Score",
      value: "94.2%",
      subtext: t('quality.complianceISO'),
      icon: ShieldCheck,
      color: "bg-emerald-500",
      shadow: "shadow-emerald-500/20",
      view: 'overview'
    },
    {
      id: 'alerts',
      label: "Alertas Críticos",
      value: 0,
      subtext: "Operação Nominal",
      icon: Activity,
      color: "bg-slate-900",
      shadow: "shadow-slate-900/20",
      view: 'audit-log'
    }
  ], [totalClients, totalPendingDocs, t]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

/* --- Sub-componente Interno --- */

const KpiCard: React.FC<{ card: KpiConfig; onClick: () => void }> = ({ card, onClick }) => {
    const Icon = card.icon;
    return (
        <button
            onClick={onClick}
            className="group bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left flex flex-col justify-between min-h-[180px] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-50 transition-colors" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3.5 rounded-2xl ${card.color} text-white shadow-xl ${card.shadow} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">{card.label}</p>
              <h3 className="text-4xl font-black text-[#081437] mt-1 tracking-tighter">{card.value}</h3>
              <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{card.subtext}</p>
            </div>
        </button>
    );
};
