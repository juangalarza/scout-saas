import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente con service role: sin sesión de usuario, bypassea RLS. Solo para
// contextos de servidor de confianza (ej. el webhook de Mercado Pago, que no
// tiene cookies de sesión porque lo llama Mercado Pago, no el navegador).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
