

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Boundary de Erros do Sistema
 * Refatorado para maior estabilidade em ambientes de desenvolvimento (HMR).
 */
export class ErrorBoundary extends Component<Props, State> {
  // Fix: Initialize state as a class property for better type inference
  // Fix: Removed 'public' keyword to resolve TypeScript errors with 'this.setState' and 'this.props'
  state: State = {
    hasError: false
  };

  // Fix: Reinstated constructor to ensure `super(props)` is called,
  // which is essential for `this.props` and other inherited `Component` features.
  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Critical System Error]', error, errorInfo);
  }

  private handleReset = () => {
    // Fix: `this.setState` exists on Component, no need to suppress TS error.
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render(): ReactNode {
    // Fix: `this.props` exists on Component, no need to suppress TS error.
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-red-100 p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <AlertOctagon size={40} />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-3">Erro de Camada Crítica</h1>
          <p className="text-slate-500 mb-10 text-sm font-medium leading-relaxed">
            Ocorreu uma exceção no processamento da interface. Se você for um desenvolvedor, verifique o console do navegador.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-98 shadow-xl"
            >
              <RefreshCw size={16} /> Reiniciar Aplicação
            </button>
          </div>
        </div>
      </div>
    );
  }
}