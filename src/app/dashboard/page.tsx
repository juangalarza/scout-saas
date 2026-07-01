import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

const LIMITES: Record<string, number> = { free: 3, go: 100, pro: 250 };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profile },
    { count: sinWeb },
    { count: contactables },
    { data: searchesRubros },
    { count: totalBusquedas },
  ] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("tiene_web", false),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("telefono", "is", null),
    supabase.from("searches").select("rubro").eq("user_id", user.id),
    supabase
      .from("searches")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const plan = profile?.plan ?? "free";
  const limite = LIMITES[plan] ?? LIMITES.free;
  const nichos = new Set(
    (searchesRubros ?? []).map((s) => s.rubro.toLowerCase()),
  ).size;

  return (
    <DashboardClient
      user={user}
      statsBase={{
        sinWeb: sinWeb ?? 0,
        contactables: contactables ?? 0,
        nichos,
        busquedasUsadas: totalBusquedas ?? 0,
        busquedasLimite: limite,
      }}
    />
  );
}
