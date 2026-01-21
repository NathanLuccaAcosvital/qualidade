import React from 'react';

/**
 * Utilitário para envolver o React.lazy com lógica de recuperação de falha de rede.
 * Resolve o erro 'Failed to fetch dynamically imported module' que ocorre após novos deploys.
 */
export function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      // Verifica se o erro é uma falha de carregamento de módulo dinâmico (chunk load error)
      const isChunkError = 
        /failed to fetch dynamically imported module/i.test(error.message) ||
        /loading chunk/i.test(error.message);

      if (isChunkError) {
        console.warn('[Vital Guard] Inconsistência de versão detectada. Sincronizando interface...');
        
        // Verifica se já recarregamos nos últimos 10 segundos para evitar loops
        const lastReload = sessionStorage.getItem('vital_last_reload');
        const now = Date.now();
        
        if (!lastReload || now - parseInt(lastReload) > 10000) {
          sessionStorage.setItem('vital_last_reload', now.toString());
          window.location.reload();
          // Retorna uma promessa que nunca resolve para segurar o render até o reload
          return new Promise(() => {});
        }
      }
      
      // Se não for erro de chunk ou se o loop for detectado, repassa o erro para o ErrorBoundary
      throw error;
    }
  });
}
