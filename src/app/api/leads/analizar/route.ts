import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calcularScore } from "@/lib/mock-scout";
import type { NegocioListado } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchId, negocios } = (await request.json()) as {
    searchId: string;
    negocios: NegocioListado[];
  };

  const { data: search, error: searchError } = await supabase
    .from("searches")
    .select("id, ciudad, rubro")
    .eq("id", searchId)
    .single();

  if (searchError || !search) {
    return NextResponse.json({ error: "Búsqueda no encontrada" }, { status: 404 });
  }

  // TODO Fase 5: reemplazar por el chequeo real de web + scoring de SCOUT.
  const filas = negocios.map((negocio) => {
    const { score, criterios_json } = calcularScore(negocio);
    return {
      search_id: search.id,
      user_id: user.id,
      rubro: search.rubro,
      ciudad: search.ciudad,
      ...negocio,
      score,
      criterios_json,
    };
  });

  const { data: leads, error } = await supabase
    .from("leads")
    .insert(filas)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads });
}
