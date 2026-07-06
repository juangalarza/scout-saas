import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createClient } from "@/lib/supabase/server";
import CarteraClient, { type LeadCartera } from "./CarteraClient";

export default async function CarteraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, nombre, rubro, ciudad, rating, cantidad_reviews, estado_crm, demos(slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const leadsCartera: LeadCartera[] = (leads ?? []).map((lead) => {
    const demo = Array.isArray(lead.demos) ? lead.demos[0] : lead.demos;
    return {
      id: lead.id,
      nombre: lead.nombre,
      rubro: lead.rubro,
      ciudad: lead.ciudad,
      rating: lead.rating,
      cantidad_reviews: lead.cantidad_reviews,
      estado_crm: lead.estado_crm,
      demoSlug: demo?.slug ?? null,
    };
  });

  return (
    <Box sx={{ width: "95%", mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Mi Cartera
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Arrastrá cada lead entre columnas a medida que avanza la conversación.
      </Typography>
      <CarteraClient leadsIniciales={leadsCartera} />
    </Box>
  );
}
