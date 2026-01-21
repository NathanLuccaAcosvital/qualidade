
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageSizes = [10, 20, 50, 100, 500];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-4 sm:px-8 py-4 sm:py-5 bg-white border-t border-slate-100 rounded-b-[2.5rem]">
      {/* Esquerda: Seletor e Contagem */}
      <div className="flex items-center gap-4 sm:gap-6 order-2 lg:order-1 w-full lg:w-auto justify-between lg:justify-start border-t lg:border-t-0 pt-4 lg:pt-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[1px] sm:tracking-[1.5px] hidden xs:block">Exibir</p>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black text-[#132659] px-2 sm:px-3 py-1 sm:py-1.5 outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm cursor-pointer transition-all hover:border-blue-300"
          >
            {pageSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[1px] sm:tracking-[1.5px] whitespace-nowrap">
          Mostrando <span className="text-[#132659] font-black">{startItem}-{endItem}</span> de <span className="text-[#132659] font-black">{totalItems}</span>
        </p>
      </div>

      {/* Direita: Controles de Página */}
      <div className="flex items-center gap-1.5 sm:gap-2 order-1 lg:order-2">
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 p-1 rounded-lg sm:rounded-xl border border-slate-100 mr-1 sm:mr-2">
          <NavButton 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1 || isLoading} 
            icon={ChevronsLeft} 
          />
          <NavButton 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1 || isLoading} 
            icon={ChevronLeft} 
          />
        </div>
        
        <div className="flex items-center px-3 sm:px-4 bg-white border border-slate-100 h-8 sm:h-9 rounded-lg sm:rounded-xl shadow-sm">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span className="hidden xs:inline">Página</span> <span className="text-[#132659] font-black mx-0.5 sm:mx-1">{currentPage}</span> / <span className="text-slate-900 font-black ml-0.5 sm:ml-1">{totalPages}</span>
          </span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 p-1 rounded-lg sm:rounded-xl border border-slate-100 ml-1 sm:ml-2">
          <NavButton 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages || isLoading} 
            icon={ChevronRight} 
          />
          <NavButton 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages || isLoading} 
            icon={ChevronsRight} 
          />
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ onClick, disabled, icon: Icon }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-white border border-slate-200 text-slate-400 hover:bg-white hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:grayscale transition-all active:scale-90 shadow-sm"
  >
    <Icon size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={3} />
  </button>
);
