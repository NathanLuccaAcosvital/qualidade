
import React, { Component, ErrorInfo, type ReactNode } from 'react';
// Fix: Import missing Lucide icons
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in their child component tree.
 */
// Fix: Explicitly define the generic types for Component
export class ErrorBoundary extends Component<Props, State> {
  // Fix: Explicitly declare state and props members to help TypeScript inference.
  // This is typically redundant as Component<P, S> should provide them,
  // but can resolve "Property 'state' does not exist" errors in certain environments.
  public props: Readonly<Props>;
  public state: Readonly<State>;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    // Fix: 'state' is now correctly recognized as a property of 'this' through Component generic inheritance
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              {/* Fix: AlertOctagon icon imported */}
              <AlertOctagon size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h1>
            <p className="text-slate-500 mb-8 text-sm">
              Ocorreu um erro inesperado na renderização deste componente. Nossa equipe técnica já foi notificada.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                {/* Fix: RefreshCw icon imported */}
                <RefreshCw size={18} /> Recarregar Portal
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center gap-2 bg-white text-slate-600 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
              >
                {/* Fix: Home icon imported */}
                <Home size={18} /> Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Fix: 'props' is now correctly recognized through the Component generic inheritance
    return this.props.children;
  }
}