import React from 'react';
import { AlertOctagon, RefreshCw, Phone } from 'lucide-react';
// Fix: Updated import path for 'types' module to explicitly include '/index'
import { SystemStatus } from '../../types/index'; // Atualizado
import { useTranslation } from 'react-i18next';

interface MaintenanceScreenProps {
    status: SystemStatus;
    onRetry: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ status, onRetry }) => {
    const { t } = useTranslation();

    const formattedEnd = status.scheduledEnd 
        ? new Date(status.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : t('maintenance.soon');

    return (
        <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80 pointer-events-none" aria-hidden="true"></div>
            
            <div className="relative z-10 max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-orange-500/10 p-6 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center border-4 border-orange-500/20 shadow-2xl shadow-orange-500/10">
                    <AlertOctagon size={64} className="text-orange-500" aria-hidden="true" />
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">{t('maintenance.title')}</h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    {t('maintenance.message')}
                </p>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm mb-8">
                    <p className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">{t('maintenance.returnEstimate')}</p>
                    <p className="text-2xl font-mono text-white">
                        {formattedEnd !== t('maintenance.soon') 
                            ? t('maintenance.todayAt', { time: formattedEnd }) 
                            : t('maintenance.soon')}
                    </p>
                    {status.message && (
                        <p className="text-xs text-orange-400 mt-2 border-t border-slate-700/50 pt-2 italic">"{status.message}"</p>
                    )}
                </div>

                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={onRetry}
                        className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                        aria-label={t('maintenance.retry')}
                    >
                        <RefreshCw size={18} aria-hidden="true" /> {t('maintenance.retry')}
                    </button>
                    <a 
                        href="mailto:suporte@acosvital.com"
                        className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-600 flex items-center gap-2"
                        aria-label={t('maintenance.contact')}
                    >
                        <Phone size={18} aria-hidden="true" /> {t('maintenance.contact')}
                    </a>
                </div>
            </div>

            <div className="absolute bottom-8 text-xs text-slate-600 font-mono">
                {t('maintenance.systemId')}
            </div>
        </div>
    );
};