
import React, { useState } from 'react';
import { AlertTriangle, Hammer, X, CalendarClock, Info } from 'lucide-react';
import { SystemStatus } from '../../types.ts';

interface MaintenanceBannerProps {
    status: SystemStatus;
    isAdmin: boolean;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ status, isAdmin }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (status.mode === 'ONLINE' || !isVisible) return null;

    // Common Glassmorphism Base Styles - Reduced padding/height for a narrower look
    const containerClasses = "mx-4 mt-3 mb-1 rounded-xl p-0.5 relative z-30 overflow-hidden shadow-lg animate-in slide-in-from-top-4 duration-500 group";
    const glassContentClasses = "relative px-3 py-1.5 rounded-[10px] flex items-center justify-between backdrop-blur-md border-t border-white/20";

    if (status.mode === 'MAINTENANCE') {
        if (!isAdmin) return null;
        return (
            <div className={`${containerClasses} shadow-red-500/20`}>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-700 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                
                <div className={`${glassContentClasses} bg-red-600/20 border-red-400/30`}>
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-1.5 bg-white/10 rounded-lg shadow-inner animate-pulse">
                            <Hammer size={14} className="text-white" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-none">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-red-100 opacity-80">Bloqueado</span>
                            <span className="hidden sm:block text-red-200/50">|</span>
                            <span className="text-xs font-bold text-white drop-shadow-sm">MODO DE MANUTENÇÃO - Acesso Admin.</span>
                        </div>
                    </div>
                    <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/20 rounded-lg transition-all text-white/80 hover:text-white active:scale-95">
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
    }

    if (status.mode === 'SCHEDULED') {
        const startDate = status.scheduledStart ? new Date(status.scheduledStart) : new Date();
        const endDate = status.scheduledEnd ? new Date(status.scheduledEnd) : null;
        
        const dateStr = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStart = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const timeEnd = endDate ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '...';

        return (
            <div className={`${containerClasses} shadow-orange-500/20`}>
                {/* Sensational Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 opacity-95" />
                {/* Subtle Texture/Shine */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                
                <div className={`${glassContentClasses} bg-orange-500/10 border-white/20`}>
                    <div className="flex items-center gap-3 text-white">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/30 rounded-full blur-md animate-pulse" />
                            <div className="relative p-1.5 bg-gradient-to-br from-white/20 to-white/5 rounded-lg border border-white/30 shadow-sm">
                                <CalendarClock size={16} className="text-white drop-shadow-md" />
                            </div>
                        </div>
                        
                        <div className="flex flex-col min-w-0 sm:flex-row sm:items-center sm:gap-2">
                            <div className="flex items-center gap-2">
                                <span className="px-1.5 py-px rounded bg-black/20 text-[9px] font-bold uppercase tracking-wider text-orange-50 shadow-inner border border-white/10">
                                    Aviso
                                </span>
                                <span className="text-[10px] opacity-90 font-medium truncate hidden md:block">
                                    {status.message || 'Atualização programada'}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-white leading-tight mt-0.5 sm:mt-0 drop-shadow-sm">
                                Manutenção: {dateStr}, {timeStart} - {timeEnd}.
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsVisible(false)} 
                        className="ml-2 p-1.5 hover:bg-black/10 rounded-lg transition-all text-white border border-transparent hover:border-white/20 shadow-sm active:scale-95 group-hover:bg-white/10"
                    >
                        <X size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        );
    }

    return null;
};
