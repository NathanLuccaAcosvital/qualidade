
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, 
  Mail, 
  Lock, 
  User as UserIcon,
  ArrowRight, 
  CheckCircle2, 
  Globe,
  Building2,
  AlertOctagon,
  ChevronLeft,
  Eye,
  EyeOff,
  Briefcase
} from 'lucide-react';
import { userService, adminService } from '../lib/services/index.ts';
import { ClientOrganization } from '../types.ts';
import { CookieBanner } from '../components/common/CookieBanner.tsx';
import { PrivacyModal } from '../components/common/PrivacyModal.tsx';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationId: '',
    department: ''
  });

  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingClients, setIsFetchingClients] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      setIsFetchingClients(true);
      try {
        const data = await adminService.getClients();
        setClients(data.items.filter(c => c.status === 'ACTIVE'));
      } catch (err) {
        console.error("Erro ao carregar empresas:", err);
      } finally {
        setIsFetchingClients(false);
      }
    };
    loadClients();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const orgIdToSubmit = (formData.organizationId === 'NEW' || !formData.organizationId) 
        ? undefined 
        : formData.organizationId;

      await userService.signUp(
        formData.email.trim(), 
        formData.password, 
        formData.fullName.trim(), 
        orgIdToSubmit, 
        formData.department.trim()
      );
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const InputWrapper: React.FC<{ label: string; icon: React.ElementType; fieldId: string; children: React.ReactNode }> = ({ label, icon: Icon, fieldId, children }) => (
    <div className="space-y-2 group flex-1">
      <label className={`text-[10px] font-black uppercase tracking-[2px] ml-1 transition-colors ${focusedInput === fieldId ? 'text-[#62A5FA]' : 'text-slate-400'}`}>
        {label}
      </label>
      <div 
        className={`flex items-center bg-slate-50 border-[1.5px] rounded-2xl overflow-hidden transition-all duration-300
        ${focusedInput === fieldId ? 'border-[#62A5FA] bg-white ring-4 ring-[#62A5FA]/10 shadow-sm' : 'border-slate-100'}`}
      >
        <div className={`w-12 h-12 flex items-center justify-center border-r transition-colors ${focusedInput === fieldId ? 'text-[#62A5FA] border-[#62A5FA]/10' : 'text-slate-300 border-slate-100'}`}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white relative selection:bg-blue-100 overflow-hidden font-['Inter',_sans-serif]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.012] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      <div className="absolute top-6 right-6 z-50">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 p-1 rounded-xl shadow-sm flex items-center gap-1">
              <div className="pl-2.5 pr-1.5 text-slate-400">
                  <Globe size={14} />
              </div>
              {['pt', 'en', 'es'].map((lang) => (
                  <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${i18n.language === lang ? 'bg-[#081437] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                      {lang}
                  </button>
              ))}
          </div>
      </div>

      <div className="hidden lg:flex lg:w-[30%] relative bg-[#081437] overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay scale-110"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1920")' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#081437] via-[#081437]/90 to-[#081437]/60" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white h-full">
            <div className="space-y-12">
                <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[3px]">VOLTAR AO LOGIN</span>
                </Link>
                <img src={LOGO_URL} alt="Logo" className="h-10 object-contain drop-shadow-2xl" />
                <div className="space-y-4">
                    <div className="h-px w-8 bg-[#B23C0E]"></div>
                    <h1 className="text-3xl font-black leading-tight tracking-tighter">Solicite seu acesso corporativo.</h1>
                    <p className="text-slate-400 font-medium text-sm">Junte-se à rede de conformidade Aços Vital.</p>
                </div>
            </div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">&copy; {new Date().getFullYear()} Aços Vital S.A.</div>
        </div>
      </div>

      <div className="w-full lg:flex-1 flex items-center justify-center p-8 md:p-12 bg-white overflow-y-auto custom-scrollbar relative z-30">
        <div className="w-full max-w-[650px] space-y-10 animate-in fade-in duration-700">
            
            {success ? (
                <div className="p-16 bg-white rounded-3xl text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-50 text-[#62A5FA] rounded-full flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={40} /></div>
                    <h2 className="text-3xl font-black text-[#081437] tracking-tighter">Solicitação Enviada!</h2>
                    <p className="text-slate-500 text-sm font-medium">Seu pedido está sendo validado pela equipe técnica.</p>
                    <div className="flex justify-center pt-4">
                        <Loader2 size={24} className="animate-spin text-[#62A5FA]" />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-[#081437] tracking-tighter">Novo Registro</h2>
                        <p className="text-slate-400 text-sm font-medium">Preencha os campos abaixo com seus dados profissionais.</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <InputWrapper label="Nome Completo" icon={UserIcon} fieldId="name">
                                <input 
                                    required className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-slate-800 placeholder-slate-300"
                                    placeholder="João Silva" value={formData.fullName}
                                    onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                />
                            </InputWrapper>
                            <InputWrapper label="E-mail Corporativo" icon={Mail} fieldId="email">
                                <input 
                                    type="email" required className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-slate-800 placeholder-slate-300"
                                    placeholder="usuario@empresa.com" value={formData.email}
                                    onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </InputWrapper>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <InputWrapper label="Organização" icon={Building2} fieldId="org">
                                <select 
                                    required className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-slate-800 appearance-none cursor-pointer"
                                    value={formData.organizationId} onFocus={() => setFocusedInput('org')} onBlur={() => setFocusedInput(null)}
                                    onChange={e => setFormData({...formData, organizationId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    <option value="NEW">Minha empresa não está listada</option>
                                </select>
                            </InputWrapper>
                            <InputWrapper label="Departamento" icon={Briefcase} fieldId="dept">
                                <input 
                                    className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-slate-800 placeholder-slate-300"
                                    placeholder="Qualidade, TI..." value={formData.department}
                                    onFocus={() => setFocusedInput('dept')} onBlur={() => setFocusedInput(null)}
                                    onChange={e => setFormData({...formData, department: e.target.value})}
                                />
                            </InputWrapper>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            <InputWrapper label="Senha de Acesso" icon={Lock} fieldId="pass">
                                <input 
                                    type={showPassword ? "text" : "password"} required
                                    className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-slate-800 placeholder-slate-300"
                                    placeholder="••••••••" value={formData.password}
                                    onFocus={() => setFocusedInput('pass')} onBlur={() => setFocusedInput(null)}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-[#62A5FA] transition-colors">
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </InputWrapper>
                            <InputWrapper label="Confirmar Senha" icon={Lock} fieldId="confirm">
                                <input 
                                    type={showPassword ? "text" : "password"} required
                                    className="flex-1 px-5 py-4 bg-transparent outline-none text-sm font-normal text-slate-800 placeholder-slate-300"
                                    placeholder="••••••••" value={formData.confirmPassword}
                                    onFocus={() => setFocusedInput('confirm')} onBlur={() => setFocusedInput(null)}
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                />
                            </InputWrapper>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <AlertOctagon size={16} className="shrink-0" /> {error}
                            </div>
                        )}

                        <div className="pt-6 space-y-6">
                            <button 
                                type="submit" disabled={isLoading}
                                className="w-full bg-[#081437] hover:bg-[#0c1d4d] text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 h-14 active:scale-[0.98] disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <Loader2 size={24} className="animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className="uppercase tracking-[4px] text-[11px]">Solicitar Registro</span> 
                                        <ArrowRight size={18} className="text-[#62A5FA]" />
                                    </div>
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-400 font-medium">
                                Já possui uma conta? <Link to="/login" className="text-[#081437] font-black hover:text-[#B23C0E] transition-all uppercase tracking-wider ml-1">Fazer Login</Link>
                            </p>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
