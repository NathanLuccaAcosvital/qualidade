
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase configurado via variáveis de ambiente.
 * Para produção, utilize as variáveis injetadas pelo provider de CI/CD.
 */

const supabaseUrl = "https://wtydnzqianhahiiasows.supabase.co";
const supabaseKey = "sb_publishable_G-talSR4UyXl42B2jzglow_EB0ainxc";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("CONFIGURAÇÃO CRÍTICA AUSENTE: Supabase URL ou Key não encontradas no ambiente.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;
