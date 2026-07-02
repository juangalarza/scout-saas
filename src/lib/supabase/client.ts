import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Singleton: crear una instancia nueva en cada llamada rompe Realtime, porque
// el socket puede conectarse antes de que el cliente termine de sincronizar
// la sesión desde las cookies, y sin JWT el RLS filtra todos los broadcasts
// (el subscribe() igual devuelve "SUBSCRIBED", así que el error es silencioso).
let browserClient: SupabaseClient | undefined;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return browserClient;
}
