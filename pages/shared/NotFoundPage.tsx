import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#081437] flex items-center justify-center p-6 font-sans">
      <div className="text-center space-y-8 max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 animate-pulse"></div>
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center relative z-10 mx-auto shadow-2xl">
                <ShieldAlert size={48} className="text-orange-500" />
            </div>
        </div>
        
        <div className="space-y-3">
            <h1 className="text-8xl font-black text-white tracking-tighter leading-none">404</h1>
            <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest">Caminho Não Localizado</h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">O recurso solicitado não existe no ledger atual ou foi movido para uma zona de acesso restrito.</p>
        </div>
        
        <div className="flex flex-col gap-3">
            <button 
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-3 bg-white text-[#081437] px-8 py-5 rounded-2xl font-black hover:bg-slate-200 transition-all shadow-xl active:scale-95 uppercase text-[11px] tracking-widest w-full justify-center"
            >
                <Home size={18} /> Retornar ao Terminal
            </button>
            <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-3 bg-transparent text-slate-400 px-8 py-5 rounded-2xl font-black hover:text-white transition-all uppercase text-[11px] tracking-widest w-full justify-center border border-white/10"
            >
                <ArrowLeft size={18} /> Voltar à Página Anterior
            </button>
        </div>

        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[4px] pt-8">Vital Cloud Security Framework</p>
      </div>
    </div>
  );
};

export default NotFoundPage;