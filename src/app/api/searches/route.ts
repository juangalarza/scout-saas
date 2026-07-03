import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buscarNegocios } from "@/lib/scout/places";

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

  let negocios;
  try {
    negocios = await buscarNegocios(rubro, ciudad);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error buscando negocios";
    return NextResponse.json({ error: mensaje }, { status: 502 });
  }

  return NextResponse.json({ searchId: search.id, negocios });
}
