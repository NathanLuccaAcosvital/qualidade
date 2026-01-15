
import React from 'react';
import { FlaskConical, Activity } from 'lucide-react';
import { ChemicalComposition, MechanicalProperties } from '../../../../types/metallurgy.ts';

interface MetallurgicalDataDisplayProps {
  chemical?: ChemicalComposition;
  mechanical?: MechanicalProperties;
}

/**
 * MetallurgicalDataDisplay (Pure View)
 * Representa visualmente as propriedades físicas e químicas do aço.
 */
export const MetallurgicalDataDisplay: React.FC<MetallurgicalDataDisplayProps> = ({ chemical, mechanical }) => {
  const chemicalElements = [
    { label: 'C', value: chemical?.carbon, title: 'Carbono' },
    { label: 'Mn', value: chemical?.manganese, title: 'Manganês' },
    { label: 'Si', value: chemical?.silicon, title: 'Silício' },
    { label: 'P', value: chemical?.phosphorus, title: 'Fósforo' },
    { label: 'S', value: chemical?.sulfur, title: 'Enxofre' },
  ];

  return (
    <div className="space-y-8">
      {/* Análise Química */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-slate-400">
          <FlaskConical size={14} className="text-[var(--color-detail-blue)]" />
          <span className="text-[10px] font-black uppercase tracking-[2px]">Composição Química (%)</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {chemicalElements.map((el) => (
            <div 
                key={el.label} 
                title={el.title}
                className="p-3 border border-slate-100 rounded-xl text-center bg-slate-50/30 hover:bg-white hover:shadow-sm hover:border-[var(--color-detail-blue)] transition-all group"
            >
              <p className="text-[9px] font-black text-slate-400 uppercase group-hover:text-[var(--color-detail-blue)] transition-colors">{el.label}</p>
              <p className="text-xs font-black text-slate-800 mt-1">{el.value ?? '-'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ensaios Mecânicos */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-slate-400">
          <Activity size={14} className="text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-[2px]">Propriedades Mecânicas</span>
        </div>
        <div className="space-y-1 bg-slate-50/20 p-2 rounded-2xl border border-slate-100">
          <PropertyRow label="Escoamento" value={mechanical?.yieldStrength} unit="MPa" />
          <PropertyRow label="Resistência" value={mechanical?.tensileStrength} unit="MPa" />
          <PropertyRow label="Alongamento" value={mechanical?.elongation} unit="%" />
        </div>
      </section>
    </div>
  );
};

const PropertyRow: React.FC<{ label: string; value?: number; unit: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between items-center px-4 py-3.5 hover:bg-white hover:rounded-xl transition-all group">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{label}</span>
    <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-mono font-black text-[var(--color-detail-blue)]">
            {value ?? '--'}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{unit}</span>
    </div>
  </div>
);
