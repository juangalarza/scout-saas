import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { arsPorUsdOficial } from "@/lib/tipo-cambio";
import PricingClient from "./PricingClient";

export default async function PricingPage() {
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

  const arsPorUsd = await arsPorUsdOficial().catch(() => null);

  return <PricingClient planActual={profile?.plan ?? "free"} arsPorUsd={arsPorUsd} />;
}
