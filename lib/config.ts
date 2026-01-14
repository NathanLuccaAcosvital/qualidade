// Fix: Augmented ImportMeta interface for proper environment variable recognition without Vite types error.

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_MAINTENANCE_MODE?: string;
    readonly VITE_ENABLE_ANALYTICS?: string;
    [key: string]: string | undefined;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/**
 * Central configuration file for Environment Variables.
 * Resilient to missing variables with safe defaults.
 */

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  apiTimeout: 15000,
  features: {
    enableMaintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  upload: {
    maxSizeInBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  }
};