import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generarNegociosMock } from "@/lib/mock-scout";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { ciudad, rubro } = await request.json();

  if (!ciudad || !rubro) {
    return NextResponse.json(
      { error: "Ciudad y rubro son obligatorios" },
      { status: 400 },
    );
  }

  const { data: search, error } = await supabase
    .from("searches")
    .insert({ user_id: user.id, ciudad, rubro, estado: "pendiente" })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO Fase 5: reemplazar por la llamada real a SerpAPI (solo listado,
  // sin análisis todavía) usando el script de SCOUT.
  const negocios = generarNegociosMock(rubro, ciudad);

  return NextResponse.json({ searchId: search.id, negocios });
}
