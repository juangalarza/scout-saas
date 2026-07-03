import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analizarNegocio } from "@/lib/scout/score";
import type { NegocioListado } from "@/lib/types";

const UMBRAL_OPORTUNIDAD = 70;

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

  // Solo se guardan oportunidades reales (score >= UMBRAL_OPORTUNIDAD); el
  // resto se analiza pero se descarta, como hace Huntly (no todo negocio
  // encontrado es una "oportunidad de venta"). web_url es un campo interno
  // del pipeline (viaja del listado al análisis) que no es columna de
  // "leads", así que se descarta antes del insert.
  const analizados = await Promise.all(
    negocios.map(async (negocio) => {
      const { web_url: _webUrl, ...negocioSinWebUrl } = negocio;
      const { score, tiene_instagram, criterios_json } =
        await analizarNegocio(negocio);
      return {
        search_id: search.id,
        user_id: user.id,
        rubro: search.rubro,
        ciudad: search.ciudad,
        ...negocioSinWebUrl,
        tiene_instagram,
        score,
        criterios_json,
      };
    }),
  );

  const filas = analizados.filter((fila) => fila.score >= UMBRAL_OPORTUNIDAD);

  if (filas.length === 0) {
    return NextResponse.json({ leads: [] });
  }

  const { data: leads, error } = await supabase
    .from("leads")
    .insert(filas)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads });
}
