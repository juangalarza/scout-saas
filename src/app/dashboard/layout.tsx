import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { contarBusquedasUsadas, limiteDelPlan } from "@/lib/planes";
import DashboardShell from "./DashboardShell";

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
  const limite = limiteDelPlan(plan);
  const usadas = await contarBusquedasUsadas(supabase, user.id, plan);

  return (
    <DashboardShell
      email={user.email ?? ""}
      plan={plan}
      usadas={usadas}
      limite={limite}
    >
      {children}
    </DashboardShell>
  );
}
