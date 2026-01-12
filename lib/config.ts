
// To avoid "Cannot find type definition file for 'vite/client'" error, we remove the reference
// and manually augment the ImportMeta interface for TypeScript to recognize 'env'.

declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }
}

/**
 * Central configuration file for Environment Variables.
 * In production, these should be set in your CI/CD or Hosting Provider (Vercel/Netlify/AWS).
 */

export const config = {
  // O URL base da sua API real. Em dev pode ser localhost, em prod seu dominio.com/api
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Timeout padrão para requisições
  apiTimeout: 15000,

  // Feature Flags (para ativar/desativar recursos em produção sem deploy)
  features: {
    enableMaintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // Configurações de Upload
  upload: {
    maxSizeInBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  }
};
