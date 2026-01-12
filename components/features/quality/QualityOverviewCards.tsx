
import React from 'react';
import { Building2, Clock, Inbox, Database, ArrowUpRight, ChevronRight, Activity, ShieldAlert, AlertTriangle } from 'lucide-react';

interface QualityOverviewCardsProps {
    totalClients: number;
    totalPendingDocs: number;
    totalOpenTickets: number;
    totalInbox: number;
    onChangeView: (view: any) => void;
}

export const QualityOverviewCards: React.FC<QualityOverviewCardsProps> = ({ totalClients, totalPendingDocs, totalOpenTickets, totalInbox, onChangeView }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => onChangeView('clients')} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Building2 size={24}/></div>
                        <ArrowUpRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors"/>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Carteira Ativa</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{totalClients}</p>
                </div>
                
                <div onClick={() => onChangeView('clients')} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-orange-400">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform"><Clock size={24}/></div>
                        <ArrowUpRight size={20} className="text-slate-300 group-hover:text-orange-500 transition-colors"/>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Docs. Pendentes</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{totalPendingDocs}</p>
                </div>

                <div onClick={() => onChangeView('tickets')} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform"><Inbox size={24}/></div>
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{totalInbox} Total</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Chamados Abertos</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{totalOpenTickets}</p>
                </div>

                <div onClick={() => onChangeView('master')} className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Database size={80}/></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-white/10 text-white rounded-xl"><Database size={24}/></div>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider relative z-10">Repositório Mestre</p>
                    <p className="text-sm font-medium text-white mt-1 relative z-10 flex items-center gap-2">Acessar Arquivos <ChevronRight size={14}/></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-blue-500"/> Atividade Recente</h3>
                    <div className="p-12 text-center text-slate-400 italic text-sm">Histórico de análise carregado em tempo real.</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldAlert size={20} className="text-orange-500"/> Alertas do Sistema</h3>
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
                        <AlertTriangle className="text-orange-600 shrink-0" size={20} />
                        <div>
                            <p className="text-sm font-bold text-orange-800">Conformidade ISO 9001</p>
                            <p className="text-xs text-orange-700 mt-1">Verificação semestral agendada para o próximo mês.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
