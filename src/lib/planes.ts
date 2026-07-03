import type { SupabaseClient } from "@supabase/supabase-js";

export const LIMITES_BUSQUEDAS: Record<string, number> = {
  free: 3,
  go: 100,
  pro: 250,
};

export function limiteDelPlan(plan: string): number {
  return LIMITES_BUSQUEDAS[plan] ?? LIMITES_BUSQUEDAS.free;
}

// Free: 3 búsquedas de por vida. Go/Pro: límite mensual (se resetea el día 1).
export async function contarBusquedasUsadas(
  supabase: SupabaseClient,
  userId: string,
  plan: string,
): Promise<number> {
  let query = supabase
    .from("searches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (plan !== "free") {
    const primerDiaDelMes = new Date();
    primerDiaDelMes.setDate(1);
    primerDiaDelMes.setHours(0, 0, 0, 0);
    query = query.gte("created_at", primerDiaDelMes.toISOString());
  }

  const { count } = await query;
  return count ?? 0;
}
