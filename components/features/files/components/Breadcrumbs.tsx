
import React from 'react';
import { ChevronRight, Archive, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../../../types/index.ts';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (id: string | null) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs, onNavigate }) => {
  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1" aria-label="Hierarquia de Dossiers">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={item.id || `bc-${index}`}>
            <button 
              onClick={() => onNavigate(item.id)}
              disabled={isLast}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${isLast 
                    ? 'text-blue-600 bg-blue-50 border border-blue-100' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}
              `}
            >
              {isFirst && <Home size={14} className={isLast ? 'text-blue-600' : 'text-slate-400'} />}
              <span className="truncate max-w-[120px] md:max-w-[200px]">{item.name}</span>
            </button>
            
            {!isLast && (
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
