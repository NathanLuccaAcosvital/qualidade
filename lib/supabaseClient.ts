import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * Centraliza a conexão com o backend.
 */

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Removido
// const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY; // Removido


  const supabaseUrl = 'https://wtydnzqianhahiiasows.supabase.co';
  const supabaseKey = 'sb_publishable_G-talSR4UyXl42B2jzglow_EB0ainxc';


// Removido o aviso de variáveis de ambiente, já que agora são valores fixos.
// if (!supabaseUrl || !supabaseKey) {
//   console.warn("SUPABASE_CONFIG_MISSING: As variáveis de ambiente do Supabase não foram detectadas. Certifique-se de configurar o arquivo .env.");
// }

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;