
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

const BACKGROUND_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/header_login.webp";
const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

export const LoginHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex flex-col w-full h-full text-white overflow-hidden pt-6 md:pt-8 lg:pt-10 xl:pt-12 px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 pb-4 md:pb-6 lg:pb-8 xl:pb-10">
      {/* Camada de Granulação Industrial Local */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" aria-hidden="true" />
      
      {/* Grid Industrial de Fundo - Sutil */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
        aria-hidden="true"
      />

      {/* Header: Logo */}
      <div className="relative z-10 shrink-0 -mt-2 md:-mt-4 lg:-mt-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <img 
          src={LOGO_URL} 
          alt="Aços Vital - Logo Industrial" 
          className="h-12 lg:h-14 xl:h-16 2xl:h-24 object-contain object-left filter brightness-0 invert drop-shadow-2xl" 
        />
      </div>

      {/* Main Content: Justificado com margem superior para não encavalar */}
      <div className="relative z-10 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 py-8">
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          
          {/* Subtitle com Detalhe Laranja Vital */}
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-8 bg-[var(--color-accent-orange)] shadow-[0_0_12px_rgba(255,107,43,0.4)]" aria-hidden="true"></div>
              <span className="text-[var(--color-accent-orange)] text-xs lg:text-sm xl:text-base font-bold uppercase tracking-[3px]">
                {t('login.subtitle')}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-7xl font-bold leading-[1.1] tracking-tight uppercase max-w-lg lg:max-w-2xl">
              ESTRUTURAS<br/>
              <span className="text-white/70">DE CONFIANÇA.</span><br/>
              <span className="text-white/50">DADOS DE PRECISÃO.</span>
            </h1>
          </div>
          
          <p className="text-sm md:text-base xl:text-lg text-slate-300/80 font-medium leading-relaxed max-w-sm lg:max-w-md xl:max-w-lg">
            {t('login.heroSubtitle')}
          </p>
          
          {/* Badges Outlined */}
          <div className="flex flex-wrap gap-2 pt-2" role="list">
             <StatusTag icon={CheckCircle2} label={t('login.certification')} />
             <StatusTag icon={ShieldCheck} label={t('login.secureData')} />
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-white/70 group cursor-default transition-all hover:bg-white/10" role="listitem">
                <Cpu size={10} className="text-[var(--color-detail-blue)] opacity-70" aria-hidden="true" />
                <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[1.5px]">Real-Time Monitoring</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Industrial Slim - Posição final da tela */}
      <footer className="relative z-10 shrink-0 flex items-center justify-between border-t border-white/5 pt-6 text-[9px] lg:text-[10px] xl:text-xs font-bold uppercase tracking-[2px] text-white/30">
          <div className="flex items-center gap-3">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </div>
            <span>{t('login.monitoring')}</span>
          </div>
      </footer>
      
      {/* Background Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <img 
          src={BACKGROUND_URL}
          alt=""
          className="w-full h-full object-cover opacity-60 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-dark-blue)] via-[var(--color-primary-dark-blue)]/90 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[var(--color-detail-blue)]/10 via-transparent to-transparent" />
      </div>
    </div>
  );
};

const StatusTag = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold uppercase tracking-[1.5px] text-white/70 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 transition-all hover:border-white/20" role="listitem">
    <Icon size={10} className="text-[var(--color-detail-blue)] opacity-70" aria-hidden="true" /> 
    {label}
  </div>
);
