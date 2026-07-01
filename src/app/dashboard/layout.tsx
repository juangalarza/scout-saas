import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "./DashboardShell";

const LIMITES: Record<string, number> = { free: 3, go: 100, pro: 250 };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan ?? "free";
  const limite = LIMITES[plan] ?? LIMITES.free;

  let query = supabase
    .from("searches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (plan !== "free") {
    const primerDiaDelMes = new Date();
    primerDiaDelMes.setDate(1);
    primerDiaDelMes.setHours(0, 0, 0, 0);
    query = query.gte("created_at", primerDiaDelMes.toISOString());
  }

  const { count } = await query;

  return (
    <DashboardShell
      email={user.email ?? ""}
      plan={plan}
      usadas={count ?? 0}
      limite={limite}
    >
      {children}
    </DashboardShell>
  );
}
