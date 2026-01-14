
import React, { useState } from 'react';
import { Hammer, X, CalendarClock } from 'lucide-react';
import { SystemStatus } from '../../types/index.ts';

interface MaintenanceBannerProps {
    status: SystemStatus;
    isAdmin: boolean;
}

/**
 * Utilitário de formatação de janela de tempo.
 */
const formatMaintenanceWindow = (start?: string, end?: string) => {
    if (!start) return { date: '', start: '', end: '' };
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    
    return {
        date: startDate.toLocaleDateString('pt-BR'),
        start: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        end: endDate ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '...'
    };
};

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ status, isAdmin }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (status.mode === 'ONLINE' || !isVisible) return null;

    if (status.mode === 'MAINTENANCE') {
        return isAdmin ? <CriticalBanner onClose={() => setIsVisible(false)} /> : null;
    }

    if (status.mode === 'SCHEDULED') {
        return <ScheduledBanner status={status} onClose={() => setIsVisible(false)} />;
    }

    return null;
};

/* --- Sub-componentes Especializados (SRP) --- */

const CriticalBanner = ({ onClose }: { onClose: () => void }) => (
    <div className="top-0 left-0 right-0 rounded-b-xl relative z-30 overflow-hidden shadow-lg shadow-red-500/20 animate-in slide-in-from-top-4">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-90" />
        <div className="relative px-4 py-2 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3 text-white">
                <Hammer size={16} className="animate-bounce" />
                <span className="text-xs font-black uppercase tracking-widest">MODO DE MANUTENÇÃO ATIVO (ADMIN)</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1"><X size={14} /></button>
        </div>
    </div>
);

const ScheduledBanner = ({ status, onClose }: { status: SystemStatus, onClose: () => void }) => {
    const window = formatMaintenanceWindow(status.scheduledStart, status.scheduledEnd);
    
    return (
        <div className="top-0 left-0 right-0 rounded-b-xl relative z-30 overflow-hidden shadow-lg shadow-orange-500/20 animate-in slide-in-from-top-4">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 opacity-95" />
            <div className="relative px-4 py-2 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3 text-white">
                    <CalendarClock size={16} />
                    <div className="flex flex-col sm:flex-row sm:gap-2 items-start sm:items-center">
                        <span className="text-[10px] font-black uppercase bg-black/20 px-1.5 rounded">AVISO</span>
                        <span className="text-xs font-bold">Manutenção Programada: {window.date} ({window.start} - {window.end})</span>
                    </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white p-1"><X size={14} /></button>
            </div>
        </div>
    );
};
