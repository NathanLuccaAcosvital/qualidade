
import React, { useState } from 'react';
import { useAuth } from '../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, ShieldAlert, Lock, Mail, ArrowRight, Eye, EyeOff, AlertOctagon, ChevronLeft } from 'lucide-react';
import { UserRole, normalizeRole } from '../types/index.ts';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const INTERNAL_HERO = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

const InternalLoginPage: React.FC = () => {
  const { login, isLoading, user } = useAuth();
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redireciona se for staff logado
  if (user) {
    const role = normalizeRole(user.role);
    if (role === UserRole.ADMIN || role === UserRole.QUALITY) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(credentials.email, credentials.password);
    if (!result.success) {
        setError(result.error || "Falha técnica no portal interno.");
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* Branding Técnico Lado Esquerdo */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[60%] relative bg-[#081437]">
        <div className="absolute inset-0 bg-cover bg-center animate-pulse-slow" style={{ backgroundImage: `url("${INTERNAL_HERO}")` }} />
        <div className="absolute inset-0 bg-[#081437]/80 mix-blend-multiply" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20 w-full text-white">
          <div className="flex flex-col gap-8 xl:gap-12">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[4px]">Portal Público</span>
            </Link>
            <img src={LOGO_URL} alt="Aços Vital" className="h-10 xl:h-16 self-start drop-shadow-2xl" />
          </div>
          
          <div className="space-y-4 xl:space-y-6">
            <div className="h-[2px] w-12 bg-blue-500" />
            <h1 className="text-4xl xl:text-6xl font-black tracking-tighter leading-tight">Staff Portal<br/><span className="text-blue-400">Control Center.</span></h1>
            <p className="text-base xl:text-xl text-slate-400 font-medium max-w-xl leading-relaxed">Ambiente restrito para auditores técnicos e administradores globais.</p>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[5px] text-slate-500">Intranets & Governance v2.4</p>
        </div>
      </div>

      {/* Form de Login Staff Lado Direito */}
      <main className="w-full lg:flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[380px] xl:max-w-[420px] p-1 bg-gradient-to-br from-slate-100 to-transparent rounded-3xl">
          <div className="bg-white rounded-[1.4rem] p-8 xl:p-10 space-y-6 xl:space-y-10 shadow-sm border border-slate-50">
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <ShieldAlert size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Acesso Restrito Staff</span>
              </div>
              <h2 className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tighter">Entrar agora.</h2>
              <p className="text-slate-400 text-xs xl:text-sm font-medium">Use sua identidade corporativa.</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-5 xl:space-y-6">
              <StaffInputField label="ID Corporativo" icon={Mail} type="email" value={credentials.email} onChange={v => setCredentials({...credentials, email: v})} placeholder="seu.nome@acosvital.com" />
              <StaffInputField label="Código de Segurança" icon={Lock} type={showPassword ? "text" : "password"} value={credentials.password} onChange={v => setCredentials({...credentials, password: v})} placeholder="••••••••" showToggle onToggle={() => setShowPassword(!showPassword)} isToggled={showPassword} />

              {error && (
                <div className="p-3 bg-orange-50 text-orange-700 text-[9px] font-bold rounded-xl border border-orange-100 flex items-center gap-2">
                  <AlertOctagon size={14} /> {error}
                </div>
              )}

              <button disabled={isLoading} className="w-full bg-[#081437] hover:bg-slate-800 text-white font-black h-12 xl:h-14 rounded-xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50">
                 {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><span className="uppercase tracking-[4px] text-[10px]">Autenticar</span><ArrowRight size={18} className="text-blue-500" /></>}
              </button>
            </form>

            <footer className="text-center pt-6 xl:pt-8 border-t border-slate-50">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  Governance & Compliance Aços Vital
               </p>
            </footer>
          </div>
        </div>
      </main>
      <style>{`.animate-pulse-slow { animation: pulse-slow 20s infinite alternate; } @keyframes pulse-slow { from { transform: scale(1); } to { transform: scale(1.05); } }`}</style>
    </div>
  );
};

const StaffInputField = ({ label, icon: Icon, value, onChange, type, placeholder, showToggle, onToggle, isToggled }: any) => (
  <div className="space-y-1.5">
    <label className="text-[8px] font-black uppercase tracking-[2px] text-slate-400 ml-1">{label}</label>
    <div className="flex items-center bg-slate-50 border-b-2 border-slate-100 focus-within:border-blue-500 focus-within:bg-white transition-all overflow-hidden">
       <div className="w-10 h-10 xl:h-12 flex items-center justify-center text-slate-300"><Icon size={16} /></div>
       <input type={type} required className="flex-1 px-3 py-2 xl:py-3 bg-transparent outline-none text-[11px] xl:text-xs font-bold text-slate-800" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
       {showToggle && <button type="button" onClick={onToggle} className="px-3 text-slate-300 hover:text-blue-500">{isToggled ? <EyeOff size={14} /> : <Eye size={14} />}</button>}
    </div>
  </div>
);

export default InternalLoginPage;
