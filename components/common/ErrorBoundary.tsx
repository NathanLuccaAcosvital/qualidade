import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Copy, ChevronDown, ChevronUp, DatabaseZap } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * CORE VITAL - ERROR BOUNDARY (RESILIENCE LAYER)
 * Proteção de última instância para falhas catastróficas.
 * Projetado para funcionar mesmo se o sistema de estilos ou tradução falhar.
 */
// Fix: Extending Component directly from react to ensure inheritance is correctly resolved by TypeScript
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Atualiza o estado para que o próximo render mostre a UI de fallback.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log forense para auditoria
    console.error('[FATAL_SYSTEM_CRASH]', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    // Fix: setState is inherited from Component base class
    this.setState({ errorInfo });
  }

  private handleSoftReset = () => {
    // Fix: setState is available on this instance extending Component
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleHardReset = () => {
    // Limpeza profunda para resolver estados corrompidos no navegador
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  private copyErrorToClipboard = () => {
    const diagnostic = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
    `;
    navigator.clipboard.writeText(diagnostic);
    alert('Relatório de erro copiado para a área de transferência.');
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans text-slate-300">
          {/* Background Gradients for Aesthetic Depth */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-2xl w-full bg-[#081437]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-500">
            <div className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-inner animate-pulse">
                    <ShieldAlert size={48} className="text-red-500" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#081437] border border-white/10 rounded-xl flex items-center justify-center text-orange-500 shadow-xl">
                    <AlertTriangle size={20} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                    Interrupção de Camada Crítica
                  </h1>
                  <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto">
                    O motor de renderização encontrou uma exceção imprevista. O protocolo de segurança isolou a falha para proteger seus dados industriais.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
                  <button
                    onClick={this.handleSoftReset}
                    className="flex items-center justify-center gap-3 bg-white text-[#081437] py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
                  >
                    <RefreshCw size={16} /> Reiniciar Interface
                  </button>
                  <button
                    onClick={this.handleHardReset}
                    className="flex items-center justify-center gap-3 bg-white/5 text-slate-300 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                  >
                    <DatabaseZap size={16} /> Limpeza Profunda
                  </button>
                </div>

                <div className="w-full pt-6 border-t border-white/5">
                  <button 
                    // Fix: setState call from Component instance
                    onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-slate-500 hover:text-slate-300 transition-colors mx-auto"
                  >
                    {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Diagnóstico Técnico
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-6 text-left space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="bg-black/40 rounded-2xl p-6 border border-white/5 relative group">
                        <button 
                          onClick={this.copyErrorToClipboard}
                          className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Copiar Diagnóstico"
                        >
                          <Copy size={14} />
                        </button>
                        <p className="text-red-400 font-mono text-xs font-bold mb-2">Exceção:</p>
                        <code className="text-[10px] text-slate-400 font-mono block break-words leading-relaxed">
                          {this.state.error?.toString()}
                        </code>
                        {this.state.errorInfo && (
                          <>
                            <p className="text-blue-400 font-mono text-xs font-bold mt-4 mb-2">Localização do Crash:</p>
                            <code className="text-[9px] text-slate-500 font-mono block whitespace-pre-wrap overflow-x-auto max-h-40 custom-scrollbar">
                              {this.state.errorInfo.componentStack}
                            </code>
                          </>
                        )}
                      </div>
                      <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest">
                        Reporte este código ao administrador do sistema para depuração industrial.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white/5 px-8 py-4 text-center">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[5px]">
                Vital Cloud Security Framework v4.2
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Fix: Accessing children from props inherited from Component
    return this.props.children;
  }
}
