import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generarMensajeApertura } from "@/lib/mensaje-apertura";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { leadId } = await params;

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("nombre, rubro, ciudad, rating, cantidad_reviews")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  try {
    const mensaje = await generarMensajeApertura({
      nombre: lead.nombre,
      rubro: lead.rubro,
      ciudad: lead.ciudad,
      rating: lead.rating ?? 0,
      cantidadReviews: lead.cantidad_reviews ?? 0,
    });
    return NextResponse.json({ mensaje });
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error generando el mensaje";
    return NextResponse.json({ error: mensaje }, { status: 502 });
  }
}
