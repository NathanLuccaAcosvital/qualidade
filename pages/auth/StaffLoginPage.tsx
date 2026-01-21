import React, { useState } from 'react';
import { useAuth } from '../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { Loader2, ShieldAlert, Lock, Mail, ArrowRight, Eye, EyeOff, AlertOctagon, ChevronLeft } from 'lucide-react';
import { UserRole, normalizeRole } from '../../types/index.ts';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const INTERNAL_HERO = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";

const StaffLoginPage: React.FC = () => {
  const { login, isLoading, user } = useAuth();
  const { t } = useTranslation();
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    const role = normalizeRole(user.role);
    if (role === UserRole.ADMIN || role === UserRole.QUALITY) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(credentials.email, credentials.password);
    if (!result.success) {
        setError(result.error ? t(result.error) : t('auth.errors.unexpected'));
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      <div className="hidden lg:flex lg:w-[50%] xl:w-[60%] relative bg-[#081437]">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url("${INTERNAL_HERO}")` }} />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20 w-full text-white">
          <div className="flex flex-col gap-8 xl:gap-12">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[4px]">Portal de Clientes</span>
            </Link>
            <img src={LOGO_URL} alt="Aços Vital" className="h-10 xl:h-16 self-start filter brightness-0 invert" />
          </div>
          
          <div className="space-y-4 xl:space-y-6">
            <div className="h-[2px] w-12 bg-blue-500" />
            <h1 className="text-4xl xl:text-6xl font-black tracking-tighter leading-tight">Staff Portal<br/><span className="text-blue-400">Control Center.</span></h1>
            <p className="text-base xl:text-xl text-slate-400 font-medium max-w-xl leading-relaxed">Ambiente restrito para auditores técnicos e administradores globais.</p>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[5px] text-slate-500">Internal Governance v2.4</p>
        </div>
      </div>

      <main className="w-full lg:flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[380px] space-y-10">
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <ShieldAlert size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Acesso Restrito Staff</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Autenticação.</h2>
              <p className="text-slate-400 text-sm font-medium">Use sua identidade corporativa Aços Vital.</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-[2px] text-slate-400 ml-1">E-mail Corporativo</label>
                    <div className="flex items-center bg-slate-50 border-b-2 border-slate-100 focus-within:border-blue-500 transition-all overflow-hidden">
                       <div className="w-10 h-12 flex items-center justify-center text-slate-300"><Mail size={16} /></div>
                       <input type="email" required className="flex-1 px-3 py-3 bg-transparent outline-none text-xs font-bold text-slate-800" placeholder="seu.nome@acosvital.com" value={credentials.email} onChange={e => setCredentials({...credentials, email: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Chave de Segurança</label>
                    <div className="flex items-center bg-slate-50 border-b-2 border-slate-100 focus-within:border-blue-500 transition-all overflow-hidden">
                       <div className="w-10 h-12 flex items-center justify-center text-slate-300"><Lock size={16} /></div>
                       <input type={showPassword ? "text" : "password"} required className="flex-1 px-3 py-3 bg-transparent outline-none text-xs font-bold text-slate-800" placeholder="••••••••" value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})} />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 text-slate-300 hover:text-blue-500">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-orange-50 text-orange-700 text-[9px] font-bold rounded-xl border border-orange-100 flex items-center gap-2">
                  <AlertOctagon size={14} /> {error}
                </div>
              )}

              <button disabled={isLoading} className="w-full bg-[#081437] hover:bg-slate-800 text-white font-black h-14 rounded-xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50">
                 {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><span className="uppercase tracking-[4px] text-[10px]">Autenticar Terminal</span><ArrowRight size={18} className="text-blue-500" /></>}
              </button>
            </form>

            <footer className="text-center pt-8 border-t border-slate-50">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  Vital Cloud Security Standard
               </p>
            </footer>
        </div>
      </main>
    </div>
  );
};

export default StaffLoginPage;