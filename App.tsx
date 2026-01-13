import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/authContext.tsx';
import { AppRoutes } from './routes.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { NotificationProvider } from './context/notificationContext.tsx'; // Importado

/**
 * Componente Raiz da Aplicação
 * Hierarquia de Provedores:
 * 1. ErrorBoundary: Captura falhas críticas em toda a árvore.
 * 2. HashRouter: Prover contexto de navegação para todos os sub-componentes.
 * 3. NotificationProvider: Prover sistema de notificações toast.
 * 4. AuthProvider: Prover estado de autenticação (agora com acesso ao Router).
 * 5. AppRoutes: Definição lógica das rotas e telas.
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <NotificationProvider> {/* Adicionado NotificationProvider */}
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </NotificationProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;