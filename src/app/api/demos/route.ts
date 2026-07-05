import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { templateParaRubro } from "@/lib/demos/templates";
import { obtenerFotosYReviews } from "@/lib/demos/fotos";
import { generarCopy } from "@/lib/demos/copy";
import { generarSlug } from "@/lib/demos/slug";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { leadId } = (await request.json()) as { leadId?: string };
  if (!leadId) {
    return NextResponse.json({ error: "Falta leadId" }, { status: 400 });
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, nombre, rubro, ciudad, rating, cantidad_reviews, place_id, estado_crm")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  // Si ya existe una demo para este lead, se reusa en vez de gastar otra
  // llamada a Claude/Places por cada click en "Ver demo".
  const { data: existente } = await supabase
    .from("demos")
    .select("slug")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (existente) {
    return NextResponse.json({ slug: existente.slug });
  }

  const template = templateParaRubro(lead.rubro);

  try {
    const { fotos, reviews } = await obtenerFotosYReviews(
      lead.place_id ?? "",
      template,
    );
    const copyGenerado = await generarCopy({
      nombre: lead.nombre,
      rubro: lead.rubro,
      ciudad: lead.ciudad,
      rating: lead.rating ?? 0,
      cantidadReviews: lead.cantidad_reviews ?? 0,
      reviews,
    });
    const slug = generarSlug(lead.nombre, lead.id);

    const { error: insertError } = await supabase.from("demos").insert({
      lead_id: lead.id,
      user_id: user.id,
      slug,
      template,
      copy_generado: copyGenerado,
      fotos,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (lead.estado_crm === "nuevo") {
      await supabase
        .from("leads")
        .update({ estado_crm: "demo_enviada" })
        .eq("id", lead.id);
    }

    return NextResponse.json({ slug });
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error generando la demo";
    return NextResponse.json({ error: mensaje }, { status: 502 });
  }
}
