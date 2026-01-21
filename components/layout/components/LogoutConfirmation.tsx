import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LogoutConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
      <div className="p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Encerrar Sessão?</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Você precisará de suas credenciais técnicas para acessar o portal Vital novamente.</p>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConfirm();
            }}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-600/20"
          >
            Confirmar Desconexão
          </button>
          <button 
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel();
            }}
            className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Manter Acesso
          </button>
        </div>
      </div>
    </div>
  </div>
);