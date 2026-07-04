import type { SupabaseClient } from "@supabase/supabase-js";

export const LIMITES_BUSQUEDAS: Record<string, number> = {
  free: 3,
  go: 100,
  pro: 250,
};

export function limiteDelPlan(plan: string): number {
  return LIMITES_BUSQUEDAS[plan] ?? LIMITES_BUSQUEDAS.free;
}

// Los planes pagos no son suscripciones con débito automático: son pagos
// únicos que activan el plan por 30 días (plan_expira_en). Si ya venció y
// el usuario no volvió a pagar, se lo devuelve a Free acá mismo (se llama
// desde cualquier lugar que necesite saber el plan real del usuario, para
// que nunca quede desincronizado entre pantallas).
export async function obtenerPlanVigente(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ plan: string; expiraEn: string | null }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expira_en")
    .eq("id", userId)
    .single();

  const plan = profile?.plan ?? "free";
  const expiraEn = profile?.plan_expira_en ?? null;

  const vencido = plan !== "free" && (!expiraEn || new Date(expiraEn) < new Date());
  if (vencido) {
    await supabase
      .from("profiles")
      .update({ plan: "free", plan_expira_en: null })
      .eq("id", userId);
    return { plan: "free", expiraEn: null };
  }

  return { plan, expiraEn };
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
