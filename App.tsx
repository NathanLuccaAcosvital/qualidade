import React, { Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/authContext.tsx';
import { AppRoutes } from './routes.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { NotificationProvider } from './context/notificationContext.tsx';
import { ScrollToTop } from './components/common/ScrollToTop.tsx';
import { Loader2 } from 'lucide-react';
import './lib/i18n.ts';

const GlobalSuspenseFallback = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#081437]">
    <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Preparando o Portal da Qualidade Aços Vital</p>
  </div>
);

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<GlobalSuspenseFallback />}>
      <HashRouter>
        <ScrollToTop />
        <NotificationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NotificationProvider>
      </HashRouter>
    </Suspense>
  </ErrorBoundary>
);

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;