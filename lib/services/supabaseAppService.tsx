// Adicione ao seu objecto de serviço ou crie uma função isolada
import { supabase } from '../supabaseClient';
import { normalizeRole } from '../mappers/roleMapper';
import { withTimeout } from '../utils/apiUtils.ts'; // Import withTimeout
import { SystemStatus } from '../../types/system'; // Import SystemStatus for explicit type
// Import PostgrestResponse for explicit typing of Supabase RPC result
import { PostgrestResponse } from '@supabase/supabase-js';
import { AccountStatus } from '../../types/auth'; // Import AccountStatus for explicit casting

const API_TIMEOUT = 8000; // Define API_TIMEOUT para este serviço (8 segundos)

// Define the expected RPC data structure
interface InitialAppDataRpcResult {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    organization_id: string | null;
    organization_name: string | null;
    status: string; // Assuming raw status might be string, will cast to AccountStatus
    department: string | null;
    last_login: string | null;
  } | null;
  systemStatus: {
    mode: 'ONLINE' | 'MAINTENANCE' | 'SCHEDULED'; // Ensure this matches SystemStatus['mode']
    message: string | null;
    scheduled_start: string | null;
    scheduled_end: string | null;
    updated_by: string | null;
  } | null;
}

export const SupabaseAppService = {
  getInitialData: async () => {
    try {
      // Fix: Wrap the RPC call in Promise.resolve to make it a Promise<PostgrestResponse>
      const rpcPromise: Promise<PostgrestResponse<InitialAppDataRpcResult>> = Promise.resolve(supabase.rpc('get_initial_app_data'));

      // Protect the RPC call with a timeout
      // Fix: Destructure data and error from the PostgrestResponse object
      const { data, error } = await withTimeout(
        rpcPromise,
        API_TIMEOUT,
        "Tempo esgotado ao buscar dados iniciais da aplicação."
      );

      if (error) throw error;
      // Ensure 'data' is not null before proceeding
      if (!data) throw new Error("Dados não retornados pelo RPC.");

      // Mapping raw SQL data to application types
      const rawUser = data.user;
      const rawSystem = data.systemStatus;

      // Convert raw user to domain User
      const domainUser = rawUser ? {
        id: rawUser.id,
        name: rawUser.full_name || 'Usuário',
        email: rawUser.email || '',
        role: normalizeRole(rawUser.role),
        organizationId: rawUser.organization_id || undefined, // Use undefined for null
        organizationName: rawUser.organization_name || 'Aços Vital',
        status: rawUser.status as AccountStatus, // Cast to AccountStatus
        department: rawUser.department || undefined, // Use undefined for null
        lastLogin: rawUser.last_login || undefined // Use undefined for null
      } : null;

      // Convert raw system status (snake_case) to camelCase, ensuring correct mode type
      const domainSystem: SystemStatus | null = rawSystem ? {
        mode: rawSystem.mode, // `rawSystem.mode` is already typed correctly by InitialAppDataRpcResult
        message: rawSystem.message || undefined, // Use undefined for null
        scheduledStart: rawSystem.scheduled_start || undefined, // Use undefined for null
        scheduledEnd: rawSystem.scheduled_end || undefined, // Use undefined for null
        updatedBy: rawSystem.updated_by || undefined // Use undefined for null
      } : null;

      return { user: domainUser, systemStatus: domainSystem };
    } catch (err) {
      console.error("Falha no RPC get_initial_app_data:", err);
      // Ensure a consistent return even in case of error, allowing AuthContext
      // to detect initialization completion and display an error message or retry.
      // Fix: Explicitly cast the systemStatus object to SystemStatus to prevent type widening.
      return { user: null, systemStatus: { mode: 'ONLINE', message: 'Falha ao carregar status inicial do sistema.' } as SystemStatus };
    }
  }
};