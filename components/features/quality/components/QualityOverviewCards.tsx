import React, { useMemo } from 'react';
import { Building2, FileWarning, ShieldCheck, Activity, ArrowUpRight, LucideIcon, Info } from 'lucide-react';

interface QualityOverviewCardsProps {
  totalClients: number;
  totalPendingDocs: number;
  complianceRate: string;
  totalRejected: number;
  onNavigate: (path: string) => void;
}

interface KpiConfig {
    id: string;
    label: string;
    value: string | number;
    subtext: string;
    icon: LucideIcon;
    color: string;
    path: string;
    shadow: string;
    accent: string;
    tooltip: string;
}

export const QualityOverviewCards: React.FC<QualityOverviewCardsProps> = ({ 
  totalClients, 
  totalPendingDocs, 
  complianceRate, 
  totalRejected, 
  onNavigate 
}) => {
  const cardConfig: KpiConfig[] = useMemo(() => [
    {
      id: 'clients',
      label: "Portfólio Ativo",
      value: totalClients,
      subtext: "Empresas Monitoradas",
      icon: Building2,
      color: "bg-[#132659]",
      shadow: "shadow-slate-900/5",
      path: '/quality/portfolio',
      accent: "text-blue-400",
      tooltip: "Gestão completa da base de parceiros"
    },
    {
      id: 'pending',
      label: "Urgência Técnica",
      value: totalPendingDocs,
      subtext: "Aguardando Triagem",
      icon: FileWarning,
      color: "bg-[#b23c0e]",
      shadow: "shadow-[#b23c0e]/10",
      path: '/quality/monitor',
      accent: "text-white",
      tooltip: "Documentos prioritários para análise"
    },
    {
      id: 'compliance',
      label: "Índice de Qualidade",
      value: `${complianceRate}%`,
      subtext: "Conformidade Global",
      icon: ShieldCheck,
      color: "bg-emerald-600",
      shadow: "shadow-emerald-500/10",
      path: '/quality/audit',
      accent: "text-white",
      tooltip: "Nível de assertividade da operação"
    },
    {
      id: 'alerts',
      label: "Contestações Ativas",
      value: totalRejected,
      subtext: "Exige Intervenção",
      icon: Activity,
      color: totalRejected > 0 ? "bg-red-600" : "bg-slate-600",
      shadow: "shadow-slate-500/5",
      path: '/quality/monitor',
      accent: "text-white",
      tooltip: "Certificados com feedback negativo"
    }
  ], [totalClients, totalPendingDocs, complianceRate, totalRejected]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardConfig.map((card) => (
        <KpiCard 
            key={card.id} 
            card={card} 
            onClick={() => onNavigate(card.path)} 
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
            className="group bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-visible"
        >
            {/* Tooltip Premium */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[1.5px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100 z-[100] whitespace-nowrap shadow-2xl border border-white/10">
                {card.tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/90" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-2.5 rounded-xl ${card.color} text-white shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={card.accent} />
              </div>
              <ArrowUpRight size={16} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                  <Info size={10} className="text-slate-300" />
              </div>
              <h3 className="text-3xl font-black text-[#132659] tracking-tight">{card.value}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1 opacity-80">{card.subtext}</p>
            </div>
        </button>
    );
};