import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerPlanVigente } from "@/lib/planes";
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

  const { plan, expiraEn } = await obtenerPlanVigente(supabase, user.id);
  const arsPorUsd = await arsPorUsdOficial().catch(() => null);

  return <PricingClient planActual={plan} expiraEn={expiraEn} arsPorUsd={arsPorUsd} />;
}
