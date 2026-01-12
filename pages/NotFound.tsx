
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
            <ShieldAlert size={80} className="text-slate-900 relative z-10 mx-auto" />
        </div>
        <h1 className="text-6xl font-black text-slate-900">404</h1>
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Caminho não encontrado</h2>
            <p className="text-slate-500 text-sm">A página que você está procurando não existe ou foi movida para um novo diretório.</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
        >
          <ArrowLeft size={18} /> Voltar para segurança
        </button>
      </div>
    </div>
  );
};

export default NotFound;
